"use client";

import { useForm } from "react-hook-form";
import { FormModal } from "../form/form-modal";
import { FormCalendar } from "../form/form-calendar";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { setTimezone, translateDate } from "@/utils/helpers";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  date: z.date({
    message: "তারিখ নির্বাচন করুন",
  }),
});

export function DateFilter({ allowFuture }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
    },
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  const placeholderText = searchParams.get("date")
    ? translateDate(new Date(searchParams.get("date")))
    : translateDate(new Date(Date.now()));

  const handleSubmit = (data) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", setTimezone(data.date));
    router.push(`?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("date");
    router.push(`?${params.toString()}`);
    form.reset();
  };

  return (
    <section className="space-y-2">
      <FormModal
        form={form}
        onSubmit={handleSubmit}
        formLabel="খুজুন"
        icon="search"
      >
        <FormCalendar
          form={form}
          name="date"
          placeholder={placeholderText}
          allowFuture={allowFuture}
        />
      </FormModal>
      <Button variant="destructive" onClick={handleClear}>
        Clear
      </Button>
    </section>
  );
}
