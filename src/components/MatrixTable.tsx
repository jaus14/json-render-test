import type { ComponentFn } from "@json-render/react";
import type { Catalog } from "../lib/catalog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";

export const MatrixTable: ComponentFn<Catalog, "MatrixTable"> = ({
  props,
}) => {
  const columnHeaders = (props.columnHeaders ?? []) as string[];
  const rowHeaders = (props.rowHeaders ?? []) as string[];
  const rows = ((props.rows ?? []) as string[][]).map((row) =>
    row.map(String)
  );
  const caption = props.caption as string | undefined;
  const cornerLabel = (props.cornerLabel ?? "") as string;

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        {caption && (
          <caption className="mt-4 text-sm text-muted-foreground">
            {caption}
          </caption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted/50 font-medium">
              {cornerLabel}
            </TableHead>
            {columnHeaders.map((col) => (
              <TableHead key={col} className="bg-muted/50 text-center">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={rowHeaders[i] ?? i}>
              <TableCell className="bg-muted/50 font-medium whitespace-nowrap">
                {rowHeaders[i] ?? ""}
              </TableCell>
              {row.map((cell, j) => (
                <TableCell key={j} className="text-center">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
