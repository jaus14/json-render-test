import { useCallback } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentFn } from "@json-render/react";
import { useStateBinding } from "@json-render/react";
import type { Catalog } from "../lib/catalog";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ShadcnCheckbox({
  checked,
  indeterminate,
  onCheckedChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <CheckboxPrimitive.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className="peer h-4 w-4 shrink-0 rounded-[4px] border border-input shadow-xs
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:cursor-not-allowed disabled:opacity-50
        data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary
        data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary
        cursor-pointer"
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {indeterminate ? <MinusIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export const CustomTable: ComponentFn<Catalog, "Table"> = ({ props }) => {
  const columns = (props.columns ?? []) as string[];
  const rows = ((props.rows ?? []) as string[][]).map((row) =>
    row.map(String)
  );
  const rowIds = (props.rowIds ?? null) as string[] | null;
  const hasCheckbox = !!rowIds;

  const [selectedIds, setSelectedIds] = useStateBinding<string[]>("/selectedIds");
  const [, setSelectedCount] = useStateBinding<number>("/selectedCount");
  const selected = selectedIds ?? [];

  const toggleRow = useCallback(
    (id: string) => {
      const isSelected = selected.includes(id);
      const next = isSelected
        ? selected.filter((s) => s !== id)
        : [...selected, id];
      setSelectedIds(next);
      setSelectedCount(next.length);
    },
    [selected, setSelectedIds, setSelectedCount]
  );

  const toggleAll = useCallback(() => {
    if (!rowIds) return;
    const allSelected = selected.length === rowIds.length;
    const next = allSelected ? [] : [...rowIds];
    setSelectedIds(next);
    setSelectedCount(next.length);
  }, [rowIds, selected, setSelectedIds, setSelectedCount]);

  const allSelected =
    hasCheckbox && rows.length > 0 && selected.length === rows.length;
  const someSelected =
    hasCheckbox && selected.length > 0 && !allSelected;

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm" data-slot="table">
          {(props.caption as string | undefined) && (
            <caption className="text-muted-foreground mt-4 text-sm" data-slot="table-caption">
              {props.caption as string}
            </caption>
          )}
          <thead className="[&_tr]:border-b" data-slot="table-header">
            <tr
              className="hover:bg-muted/50 border-b transition-colors"
              data-slot="table-row"
            >
              {hasCheckbox && (
                <th
                  className="text-foreground h-10 w-10 px-4 text-left align-middle font-medium whitespace-nowrap [&>[role=checkbox]]:translate-y-[2px]"
                  data-slot="table-head"
                >
                  <ShadcnCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col}
                  className="text-foreground h-10 px-4 text-left align-middle font-medium whitespace-nowrap"
                  data-slot="table-head"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="[&_tr:last-child]:border-0"
            data-slot="table-body"
          >
            {rows.map((row, i) => {
              const id = rowIds?.[i];
              const checked = id ? selected.includes(id) : false;
              return (
                <tr
                  key={id ?? i}
                  data-state={checked ? "selected" : undefined}
                  className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                  data-slot="table-row"
                >
                  {hasCheckbox && id && (
                    <td
                      className="p-2 px-4 w-10 align-middle whitespace-nowrap [&>[role=checkbox]]:translate-y-[2px]"
                      data-slot="table-cell"
                    >
                      <ShadcnCheckbox
                        checked={checked}
                        onCheckedChange={() => toggleRow(id)}
                      />
                    </td>
                  )}
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="p-2 px-4 align-middle whitespace-nowrap"
                      data-slot="table-cell"
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
