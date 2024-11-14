import { Block } from "@/components/block";
import { PaginationControls } from "@/components/pagination-controls";
import { SalaryTable } from "@/components/salary-table";
import { getData } from "@/utils/api-calls";

async function Salaries() {
  const res = await getData("expenses/salary", 0);
  const salaries = res.response.payload;

  return <SalaryTable salaries={salaries} />;
}

export default function Page() {
  return (
    <div className="space-y-4">
      <Block title="salary statements" />
      <Salaries />
      <PaginationControls />
    </div>
  );
}
