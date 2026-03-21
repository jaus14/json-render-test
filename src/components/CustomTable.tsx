import { useCallback } from "react";
import type { ComponentFn } from "@json-render/react";
import { useStateBinding } from "@json-render/react";
import type { Catalog } from "../lib/catalog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";

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
      <Table>
        {(props.caption as string | undefined) && (
          <TableCaption>{props.caption as string}</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            {hasCheckbox && (
              <TableHead className="w-10">
                <Checkbox
                  checked={someSelected ? "indeterminate" : allSelected}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const id = rowIds?.[i];
            const checked = id ? selected.includes(id) : false;
            return (
              <TableRow
                key={id ?? i}
                data-state={checked ? "selected" : undefined}
              >
                {hasCheckbox && id && (
                  <TableCell className="w-10">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleRow(id)}
                    />
                  </TableCell>
                )}
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
