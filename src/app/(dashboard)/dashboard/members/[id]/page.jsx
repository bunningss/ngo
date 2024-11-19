import { Block } from "@/components/block";
import { MemberDetails } from "@/components/member-details";
import { getData } from "@/utils/api-calls";
import { Suspense } from "react";

async function Member({ id }) {
  const { response } = await getData(`members/${id}`, 0);

  return <MemberDetails data={response.payload} />;
}

export default async function Page({ params }) {
  return (
    <div className="space-y-4">
      <Block title="Member details" />

      {/* Member information */}
      <Suspense fallback={<p>Loading...</p>}>
        <Member id={params.id} />
      </Suspense>
    </div>
  );
}
