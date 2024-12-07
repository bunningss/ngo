import dynamic from "next/dynamic";
const MemberDetails = dynamic(
  () => import("@/components/member-details").then((mod) => mod.MemberDetails),
  { ssr: false }
);
import { Block } from "@/components/block";
import { getData } from "@/utils/api-calls";
import { Suspense } from "react";
import { Preloader } from "@/components/preloader";

async function Member({ id }) {
  const { response } = await getData(`members/${id}`, 0);

  return <MemberDetails data={response.payload} />;
}

export default async function Page({ params }) {
  return (
    <div className="space-y-4">
      <Block title="Member details / সদস্য তথ্য" />

      {/* Member information */}
      <Suspense fallback={<Preloader />}>
        <Member id={params.id} />
      </Suspense>
    </div>
  );
}
