"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { FormSelect } from "../form/form-select";
import { FormModal } from "../form/form-modal";
import { useForm } from "react-hook-form";
import { FormInput } from "../form/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { payInstallmentSchema } from "@/lib/schema";
import { errorNotification, successNotification } from "@/utils/toast";
import { putData } from "@/utils/api-calls";
import { useRouter } from "next/navigation";

export function PaySavingsInstallment({ installments }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(payInstallmentSchema),
    defaultValues: {
      installmentId: "",
      amount: installments[0]?.amount,
    },
  });

  const handleSubmit = async (data) => {
    try {
      setIsLoading(true);

      const { error, response } = await putData("savings-installments", data);
      if (error) return errorNotification(response.msg);

      successNotification(response.msg);
      form.reset();
      setIsModalOpen(false);
      router.push(
        `/dashboard/savings-installment/receipt/${data.installmentId}`
      );
    } catch (err) {
      errorNotification(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="pay installment"
      description="Add installment information here. Click save when you're done."
      triggerIcon="plus"
      triggerSize="icon"
      className="rounded-full"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onOpen={() => setIsModalOpen(true)}
    >
      <div className="space-y-4">
        <span>Remaining installments / বাকি কিস্তি: {installments.length}</span>

        <FormModal
          form={form}
          onSubmit={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          formLabel="pay installment"
        >
          <FormSelect
            form={form}
            options={installments}
            label="select installment"
            name="installmentId"
            keyName="date"
            keyValue="_id"
            keyType="date"
            placeholder="select installment"
          />
          <FormInput form={form} label="amount" name="amount" disabled />
        </FormModal>
      </div>
    </Modal>
  );
}