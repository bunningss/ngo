"use client";
import {
  translateCurrency,
  translateDate,
  translateNumber,
} from "@/utils/helpers";
import { DataTable } from "./data-table";
import { PayInstallment } from "../modals/pay-installment";
import { PrintPad } from "../print-pad";

const columns = [
  {
    header: "সি. নং",
    accessorKey: "id",
    cell: (_, index) => translateNumber(index + 1),
  },
  {
    header: "সদস্যের নাম",
    accessorKey: "memberDetails.name",
  },
  {
    header: "ফোন নম্বর",
    accessorKey: "memberDetails.phone",
  },
  {
    header: "সদস্য নম্বর",
    accessorKey: "memberDetails.nidNumber",
  },
  {
    header: "ঋণের নাম",
    accessorKey: "loanName",
  },
  {
    header: "ঋণের ধরন",
    accessorKey: "loanType",
  },
  {
    header: "ঋণের পরিমাণ",
    accessorKey: "loanAmount",
    cell: (item) => translateCurrency(item.loanAmount),
  },
  {
    header: "কিস্তির পরিমাণ",
    accessorKey: "installments",
    cell: (item) => translateCurrency(item.installments[0].amount),
  },
  {
    header: "কিস্তির তারিখ",
    accessorKey: "installments",
    cell: (item) => translateDate(item.installments[0].date),
  },
  {
    header: "",
    accessorKey: "installments",
    cell: (item) => (
      <PayInstallment
        label="pay"
        type="loan"
        installments={item.installments}
      />
    ),
  },
];

export function LoanInstallmentsTable({ installments, date }) {
  return (
    <PrintPad>
      <DataTable
        columns={columns}
        data={installments}
        header={`ঋণের কিস্তির তালিকা - ${
          date ? translateDate(date) : translateDate(new Date())
        }`}
        withAction
      />
    </PrintPad>
  );
}
