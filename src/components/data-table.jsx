"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";

export function DataTable({
  columns,
  data,
  printable = false,
  withAction = false,
}) {
  const contentRef = React.useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div>
      {printable && (
        <Button onClick={reactToPrintFn} className="mb-4 print:hidden">
          Print Data
        </Button>
      )}
      <div ref={contentRef} className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.header}
                  className={`text-center ${
                    withAction ? "print:last:hidden" : ""
                  }`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="text-center even:bg-muted">
                {columns.map((column, i) => (
                  <TableCell
                    key={i}
                    className={`min-w-[100px] lg:min-w-0 print:min-w-0 border-r last:border-r-0 ${
                      withAction ? "print:last:hidden" : ""
                    }`}
                  >
                    {column.cell
                      ? column.cell(row, rowIndex)
                      : getNestedValue(row, column.accessorKey)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
