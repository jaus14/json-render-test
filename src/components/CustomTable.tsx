import type { ComponentFn } from "@json-render/react";
import type { Catalog } from "../lib/catalog";

/**
 * Custom Table component that extends the default shadcn Table with:
 * - Optional row checkboxes (when rowIds + selectedIds are provided)
 * - whitespace-nowrap on all cells to prevent awkward line breaks
 * - Horizontal scroll on narrow viewports
 */
export const CustomTable: ComponentFn<Catalog, "Table"> = ({ props, emit, on }) => {
  const columns = (props.columns ?? []) as string[];
  const rows = ((props.rows ?? []) as string[][]).map((row) =>
    row.map(String)
  );
  const rowIds = (props.rowIds ?? null) as string[] | null;
  const selectedIds = (props.selectedIds ?? []) as string[];
  const hasCheckbox = !!rowIds;

  const selectAllHandle = on("selectAll");

  const allSelected =
    hasCheckbox && rows.length > 0 && selectedIds.length === rows.length;
  const someSelected =
    hasCheckbox && selectedIds.length > 0 && !allSelected;

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          {(props.caption as string | undefined) && (
            <caption className="text-muted-foreground mt-4 text-sm">
              {props.caption as string}
            </caption>
          )}
          <thead className="[&_tr]:border-b">
            <tr className="hover:bg-muted/50 border-b transition-colors">
              {hasCheckbox && (
                <th className="text-foreground h-10 w-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => selectAllHandle.emit()}
                    className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {rows.map((row, i) => {
              const id = rowIds?.[i];
              const checked = id ? selectedIds.includes(id) : false;
              return (
                <tr
                  key={id ?? i}
                  data-state={checked ? "selected" : undefined}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                >
                  {hasCheckbox && (
                    <td className="p-2 w-10 align-middle whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => emit("select")}
                        data-row-id={id}
                        className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                      />
                    </td>
                  )}
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="p-2 align-middle whitespace-nowrap"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
