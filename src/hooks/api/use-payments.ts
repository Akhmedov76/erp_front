import { createCrudHooks } from "@/hooks/api/create-crud-hooks";
import type { Payment, PaymentInput } from "@/types/records";

export const paymentHooks = createCrudHooks<Payment, PaymentInput, Partial<PaymentInput>>("payments");

export const usePayments = paymentHooks.useList;
export const usePayment = paymentHooks.useDetail;
export const useCreatePayment = paymentHooks.useCreate;
export const useUpdatePayment = paymentHooks.useUpdate;
export const useDeletePayment = paymentHooks.useRemove;
