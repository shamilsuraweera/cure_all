import { apiClient } from "./api-client";

export type PrescriptionItem = {
  id: string;
  dose: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  instructions?: string | null;
  medicine: { name: string; strength?: string | null };
};

export type Prescription = {
  id: string;
  status: string;
  createdAt: string;
  items: PrescriptionItem[];
};

export type RemainingItem = {
  prescriptionItemId: string;
  prescribedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
};

export type DispenseRecord = {
  id: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    prescriptionItem: {
      medicine: { name: string; strength?: string | null };
    };
  }>;
  pharmacyOrg?: { name: string };
};

export const verifyPrescription = (prescriptionId: string) =>
  apiClient.post<{ prescription: Prescription; remainingItems: RemainingItem[] }>(
    `/pharmacy/${prescriptionId}/verify`,
  );

export const dispensePrescription = (
  prescriptionId: string,
  payload: { notes?: string; items: Array<{ prescriptionItemId: string; quantity: number }> },
) =>
  apiClient.post<{ dispenseRecord: DispenseRecord }, typeof payload>(
    `/pharmacy/${prescriptionId}/dispense`,
    payload,
  );

export const fetchDispenseHistory = (prescriptionId: string, page = 1, pageSize = 10) =>
  apiClient.get<{ dispenseRecords: DispenseRecord[] }>(
    `/pharmacy/${prescriptionId}/dispenses`,
    { query: { page, pageSize } },
  );

export const listPrescriptions = (params?: { page?: number; pageSize?: number; status?: string }) =>
  apiClient.get<{ prescriptions: Prescription[] }>("/prescriptions", {
    query: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
      status: params?.status,
    },
  });

export const getPrescriptionDetail = (prescriptionId: string) =>
  apiClient.get<{ prescription: Prescription; remainingItems?: RemainingItem[] }>(
    `/prescriptions/${prescriptionId}`,
  );
