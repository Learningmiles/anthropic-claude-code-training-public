import { filterPayments, parseFilters, sortPayments } from "@/data/queries"
import {
  exportFilename,
  exportLabel,
  parseExportColumns,
  parseExportScope,
  toCsv,
} from "@/lib/csv"
import { NextRequest, NextResponse } from "next/server"

/**
 * Exports payments as CSV.
 *
 * `columns` picks and orders the columns (default: all but the card last
 * four). `scope` is `filter` (the active filters, the default) or `all`
 * (every payment, filters ignored). Both are validated here; the client's
 * checks are a convenience. Rows come from the one query builder, so this is
 * the whole result set and not the page on screen.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const parsed = parseExportColumns(params.get("columns"))
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  const scope = parseExportScope(params.get("scope"))
  if (!scope) {
    return NextResponse.json(
      { message: "Scope must be filter or all." },
      { status: 400 },
    )
  }

  const filters = parseFilters(params)
  const rows =
    scope === "all"
      ? sortPayments(filterPayments({}))
      : sortPayments(filterPayments(filters), filters.sort, filters.direction)

  return new Response(toCsv(rows, parsed.columns), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFilename(
        new Date(),
        exportLabel(scope, filters.status),
      )}"`,
    },
  })
}
