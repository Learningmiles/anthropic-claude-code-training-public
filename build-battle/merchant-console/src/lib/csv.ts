import { merchantById } from "@/data/merchants"
import { Payment } from "@/data/types"
import { formatMoney } from "./money"

/**
 * CSV export for the payments table.
 *
 * Ops chooses which columns ship (NWP-101). The card last four is opt-in: it
 * is left out unless someone asks for it, so a file is safe to send to a
 * merchant without hand-editing. Column names arrive from the client, so
 * `parseExportColumns` checks every one against `EXPORT_COLUMNS`.
 */

export const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "merchant",
  "description",
  "status",
  "method",
  "card_brand",
  "last4",
  "amount",
  "currency",
] as const

export type ExportColumn = (typeof EXPORT_COLUMNS)[number]

/** What an export contains when nobody chooses: everything except the card last four. */
export const DEFAULT_EXPORT_COLUMNS: readonly ExportColumn[] =
  EXPORT_COLUMNS.filter((column) => column !== "last4")

export type ExportScope = "filter" | "all"

export const EXPORT_SCOPES: readonly ExportScope[] = ["filter", "all"]

export type ParsedColumns =
  | { ok: true; columns: ExportColumn[] }
  | { ok: false; message: string }

/**
 * Turns the `columns` query value into a validated column list.
 *
 * - Absent (`null`) means "no choice made": the defaults, last four excluded.
 * - Present but empty, or naming anything not in `EXPORT_COLUMNS`, is rejected.
 * - Order is the order requested; a repeated column is kept once.
 */
export function parseExportColumns(raw: string | null): ParsedColumns {
  if (raw === null) return { ok: true, columns: [...DEFAULT_EXPORT_COLUMNS] }

  const requested = raw
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "")
  if (requested.length === 0) {
    return { ok: false, message: "Choose at least one column to export." }
  }

  const known = EXPORT_COLUMNS as readonly string[]
  const unknown = requested.filter((name) => !known.includes(name))
  if (unknown.length > 0) {
    return { ok: false, message: "Unknown export column." }
  }

  return {
    ok: true,
    columns: [...new Set(requested)] as ExportColumn[],
  }
}

/** Anything other than `filter` or `all` is not a scope. Absent means the default, `filter`. */
export function parseExportScope(raw: string | null): ExportScope | null {
  if (raw === null) return "filter"
  return (EXPORT_SCOPES as readonly string[]).includes(raw)
    ? (raw as ExportScope)
    : null
}

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function cell(payment: Payment, column: ExportColumn): string {
  switch (column) {
    case "id":
      return payment.id
    case "created_at":
      return payment.createdAt
    case "merchant":
      return merchantById(payment.merchantId)?.name ?? payment.merchantId
    case "description":
      return payment.description
    case "status":
      return payment.status
    case "method":
      return payment.method
    case "card_brand":
      return payment.cardBrand ?? ""
    case "last4":
      return payment.last4 ?? ""
    case "amount":
      return formatMoney(payment.amount, payment.currency)
    case "currency":
      return payment.currency
  }
}

export function toCsv(
  payments: Payment[],
  columns: readonly ExportColumn[] = EXPORT_COLUMNS,
): string {
  const header = columns.join(",")
  const rows = payments.map((payment) =>
    columns.map((column) => escapeCell(cell(payment, column))).join(","),
  )
  return [header, ...rows].join("\n")
}

/**
 * Names what the file holds: `all` for every payment, otherwise the status
 * filter, or `filtered` when the filter is a search or merchant rather than a
 * status. `status` must come from `parseFilters`, which allowlists it, never
 * straight from the request.
 */
export function exportLabel(scope: ExportScope, status?: string): string {
  if (scope === "all") return "all"
  return status && status !== "all" ? status : "filtered"
}

export function exportFilename(date = new Date(), label?: string): string {
  const day = date.toISOString().slice(0, 10)
  return label ? `payments-${label}-${day}.csv` : `payments-${day}.csv`
}
