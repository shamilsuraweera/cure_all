import { apiClient } from "./api-client";

export type PatientSearchResult = {
  id: string;
  nic: string;
  name?: string | null;
  user: {
    id: string;
    email: string;
  };
};

export type Prescription = {
  id: string;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    dose: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructions?: string | null;
    medicine: { name: string; strength?: string | null };
  }>;
};

export type LabResult = {
  id: string;
  createdAt: string;
  labTestType: { name: string };
  measures: Array<{ value: string; unit?: string | null; labMeasureDef: { name: string } }>;
};

export const searchPatients = (params: {
  nic?: string;
  email?: string;
  page?: number;
  pageSize?: number;
}) =>
  apiClient.get<{ patients: PatientSearchResult[] }>("/patients/search", {
    query: {
      nic: params.nic,
      email: params.email,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });

export const getPatientProfile = (patientProfileId: string) =>
  apiClient.get<{ patient: PatientSearchResult }>(`/patients/${patientProfileId}`);

export const getPatientPrescriptions = (patientProfileId: string) =>
  apiClient.get<{ prescriptions: Prescription[] }>(
    `/patients/${patientProfileId}/prescriptions`,
  );

export const getPatientLabResults = (patientProfileId: string) =>
  apiClient.get<{ labResults: LabResult[] }>(
    `/patients/${patientProfileId}/lab-results`,
  );

export const createPrescription = (
  patientProfileId: string,
  payload: {
    notes?: string;
    items: Array<{
      medicineId: string;
      dose: string;
      frequency: string;
      durationDays: number;
      quantity: number;
      instructions?: string;
    }>;
  },
) =>
  apiClient.post<{ prescription: Prescription }, typeof payload>(
    `/patients/${patientProfileId}/prescriptions`,
    payload,
  );
