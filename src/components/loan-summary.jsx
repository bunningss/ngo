import { translateCurrency, translateNumber } from "@/utils/helpers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Icon } from "./icon";

export function LoanSummary({ data }) {
  const midpoint = Math.ceil(data?.installments?.length / 2);
  let serialNumber = 1;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[0, 1].map((columnIndex) => (
          <Table key={columnIndex}>
            <TableCaption>
              <b>{data?.loanName}</b> ঋণের কিস্তিসমূহের তালিকা
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>সি. নং</TableHead>
                <TableHead>ঋণের নাম</TableHead>
                <TableHead>কিস্তির তারিখ</TableHead>
                <TableHead>কিস্তির পরিমান</TableHead>
                <TableHead className="text-center">
                  কিস্তির বর্তমান অবস্থা
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.installments
                ?.slice(columnIndex * midpoint, (columnIndex + 1) * midpoint)
                .map((installment, i) => {
                  const serial = serialNumber++;

                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {translateNumber(serial)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {data?.loanName}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Date(installment?.date).toDateString()}
                      </TableCell>
                      <TableCell>
                        {translateCurrency(installment?.amount)}
                      </TableCell>
                      <TableCell
                        className={`flex justify-center ${
                          installment?.status === "paid"
                            ? "text-green-800"
                            : "text-destructive"
                        }`}
                      >
                        <Icon
                          icon={
                            installment?.status === "paid" ? "done" : "close"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        ))}
      </div>
    </section>
  );
}