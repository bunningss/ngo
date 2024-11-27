"use client";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "./ui/button";
import { useReactToPrint } from "react-to-print";
import {
  translateCurrency,
  translateDate,
  translateNumber,
} from "@/utils/helpers";

export function ExpensesTable({ expenses }) {
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <>
      <Button onClick={reactToPrintFn}>Print Data</Button>
      <div className="overflow-x-auto md:rounded-md">
        <table
          className="w-full rounded-md border border-primary md:border-secondary text-xs md:text-base"
          ref={contentRef}
        >
          <thead>
            <tr className="text-center bg-input">
              <th
                scope="col"
                className="p-2 border-r border-primary md:border-secondary"
              >
                সি. নং
              </th>
              <th
                scope="col"
                className="p-2 border-r border-primary md:border-secondary"
              >
                নাম
              </th>
              <th
                scope="col"
                className="p-2 border-r border-primary md:border-secondary"
              >
                তারিখ
              </th>
              <th
                scope="col"
                className="p-2 border-r border-primary md:border-secondary"
              >
                পরিমাণ
              </th>
              <th
                scope="col"
                className="p-2 border-r border-primary md:border-secondary"
              >
                যোগ করেছেন
              </th>
              <th scope="col" className="p-2 md:border-0 print:hidden"></th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((expense, index) => (
              <tr key={index} className="text-center even:bg-secondary">
                <td className="p-2 border-r border-primary md:border-secondary">
                  {translateNumber(index + 1)}
                </td>
                <th
                  scope="row"
                  className="p-2 border-r border-primary md:border-secondary"
                >
                  {expense?.name}
                </th>
                <td className="p-2 border-r border-primary md:border-secondary">
                  {translateDate(expense.createdAt)}
                </td>
                <td className="p-2 border-r border-primary md:border-secondary">
                  {translateCurrency(expense?.amount)}
                </td>
                <td className="p-2 border-r border-primary md:border-secondary">
                  {expense.addedBy?.name}
                </td>
                <td className="p-2 md:border-0 print:hidden">
                  <Link href="" className="underline text-cyan-800 font-bold">
                    বিস্তারিত
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
