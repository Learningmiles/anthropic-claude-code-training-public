"use client"

import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { Download } from "lucide-react"
import { useId, useState } from "react"

const LABELS: Record<string, string> = {
  id: "Payment ID",
  created_at: "Date",
  merchant: "Merchant",
  description: "Description",
  status: "Status",
  method: "Method",
  card_brand: "Card brand",
  last4: "Card last four",
  amount: "Amount",
  currency: "Currency",
}

type Scope = "filter" | "all"

const checkboxClass =
  "size-4 rounded border-gray-300 accent-blue-600 dark:border-gray-700"

/**
 * Options for the payments export: which columns, and whether to export the
 * current filter or every payment. The server validates both; this only
 * builds the request. Counts come from the page, so nothing is fetched here.
 */
export function ExportDialog({
  columns,
  defaultColumns,
  query,
  filteredCount,
  allCount,
}: {
  columns: string[]
  defaultColumns: string[]
  /** The page's current query string, so "current filter" matches what is on screen. */
  query: string
  filteredCount: number
  allCount: number
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(defaultColumns)
  const [scope, setScope] = useState<Scope>("filter")
  const scopeName = useId()

  const rowCount = scope === "all" ? allCount : filteredCount
  const canDownload = selected.length > 0

  const toggle = (column: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, column] : current.filter((name) => name !== column),
    )

  // Keep the file's column order the same as the list on screen.
  const chosen = columns.filter((column) => selected.includes(column))

  const href = () => {
    const params = new URLSearchParams(query)
    params.set("columns", chosen.join(","))
    params.set("scope", scope)
    return `/api/payments/export?${params.toString()}`
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="w-full gap-2 py-1.5 sm:w-fit">
          <Download
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Export
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Export payments</DrawerTitle>
          <DrawerDescription>
            Choose what goes in the CSV. Card last four is off unless you
            switch it on.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="space-y-6">
          <fieldset>
            <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Scope
            </legend>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={scopeName}
                  className={checkboxClass}
                  checked={scope === "filter"}
                  onChange={() => setScope("filter")}
                />
                Current filter ({filteredCount.toLocaleString()} payments)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={scopeName}
                  className={checkboxClass}
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                All payments ({allCount.toLocaleString()} payments)
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Columns
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {columns.map((column) => (
                <label key={column} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={selected.includes(column)}
                    onChange={(event) => toggle(column, event.target.checked)}
                  />
                  {LABELS[column] ?? column}
                </label>
              ))}
            </div>
          </fieldset>

          <p
            role="status"
            aria-live="polite"
            className="text-sm text-gray-500"
          >
            {canDownload
              ? `${rowCount.toLocaleString()} ${rowCount === 1 ? "row" : "rows"} will be exported.`
              : "Select at least one column to download."}
          </p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="secondary" className="mt-2 w-full sm:mt-0 sm:w-fit">
              Cancel
            </Button>
          </DrawerClose>
          {canDownload ? (
            <Button className="w-full sm:w-fit" asChild>
              <a href={href()} onClick={() => setOpen(false)}>
                Download
              </a>
            </Button>
          ) : (
            <Button className="w-full sm:w-fit" disabled>
              Download
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
