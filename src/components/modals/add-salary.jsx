"use client";
import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { FormModal } from "../form/form-modal";
import { useForm } from "react-hook-form";
import { FormSelect } from "../form/form-select";
import { FormInput } from "../form/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSalarySchema } from "@/lib/schema";
import { getMonthNamesWithYear } from "@/utils/helpers";
import { errorNotification, successNotification } from "@/utils/toast";
import { postData } from "@/utils/api-calls";

export function AddSalary({ staffs }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(addSalarySchema),
    defaultValues: {
      staff: "",
      month: "",
      amount: "",
    },
  });

  const monthNamesWithYear = getMonthNamesWithYear();

  // Update salary based on staff
  const { watch, setValue } = form;
  const selectedStaff = watch("staff");

  useEffect(() => {
    if (selectedStaff) {
      const currentStaff = staffs?.find((staff) => staff._id === selectedStaff);

      if (currentStaff) {
        setValue("amount", currentStaff.salary?.toString());
      }
    } else {
      setValue("amount", "");
    }
  }, [selectedStaff, staffs, setValue]);

  const handleSubmit = async (data) => {
    setIsLoading(true);

    try {
      const res = await postData("expenses/salary", data);
      console.log(res);
      if (res.error) return errorNotification(res.response.msg);

      successNotification(res.response.msg);
      form.reset();
      setIsModalOpen(false);
    } catch (err) {
      errorNotification(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="add salary"
      description="Add salary information here. Click save when you're done."
      triggerLabel="add salary"
      triggerIcon="plus"
      className="w-full"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onOpen={() => setIsModalOpen(true)}
    >
      <FormModal
        form={form}
        onSubmit={handleSubmit}
        loading={isLoading}
        disabled={setIsLoading}
        formLabel="add salary"
      >
        <FormSelect
          form={form}
          name="staff"
          label="select staff"
          placeholder="select staff"
          required
          options={staffs}
          keyName="name"
          keyValue="_id"
        />
        <FormSelect
          form={form}
          name="month"
          label="select month"
          placeholder="select month"
          required
          options={monthNamesWithYear}
        />
        <FormInput form={form} name="amount" label="amount" required />
      </FormModal>
    </Modal>
  );
}