import { apiClient } from "./api-client";

export type PatientProfile = {
  id: string;
  userId: string;
  nic: string;
  name?: string | null;
  user: { id: string; email: string };
};

export type Prescription = {
  id: string;
  status: string;
  createdAt: string;
  notes?: string | null;
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

export type DispenseRecord = {
  id: string;
  status: string;
  createdAt: string;
  notes?: string | null;
  items: Array<{
    id: string;
    quantity: number;
    prescriptionItem: {
      medicine: { name: string; strength?: string | null };
    };
  }>;
  pharmacyOrg?: { name: string };
};

export type LabResult = {
  id: string;
  createdAt: string;
  notes?: string | null;
  labTestType: { name: string };
  measures: Array<{ value: string; unit?: string | null; labMeasureDef: { name: string } }>;
  attachments?: Array<{
    id: string;
    fileName: string;
    url: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
  }>;
};

export const getSelfPatientProfile = () =>
  apiClient.get<{ patient: PatientProfile }>("/patients/me");

export const getGuardianPatients = () =>
  apiClient.get<{ patients: PatientProfile[] }>("/guardians/patients");

export const getPatientPrescriptions = (patientProfileId: string) =>
  apiClient.get<{ prescriptions: Prescription[] }>(
    `/patients/${patientProfileId}/prescriptions`,
  );

export const getPrescriptionDetail = (prescriptionId: string) =>
  apiClient.get<{ prescription: Prescription }>(
    `/patients/prescriptions/${prescriptionId}`,
  );

export const getDispenseHistory = (prescriptionId: string) =>
  apiClient.get<{ dispenseRecords: DispenseRecord[] }>(
    `/prescriptions/${prescriptionId}/dispenses`,
  );

export const getPatientLabResults = (patientProfileId: string) =>
  apiClient.get<{ labResults: LabResult[] }>(
    `/patients/${patientProfileId}/lab-results`,
  );

export const getLabResultDetail = (labResultId: string) =>
  apiClient.get<{ labResult: LabResult }>(`/lab-results/${labResultId}`);
