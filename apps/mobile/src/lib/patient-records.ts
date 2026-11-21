import { apiClient } from "./api-client";

export type PatientProfile = {
  id: string;
  userId: string;
  nic: string;
  name?: string | null;
  dob?: string | null;
  location?: string | null;
  user: { id: string; email: string };
};

export type Prescription = {
  id: string;
  status: string;
  createdAt: string;
  notes?: string | null;
  items: {
    id: string;
    dose: string;
    frequency: string;
    durationDays: number;
    quantity: number;
    instructions?: string | null;
    medicine: { name: string; strength?: string | null };
  }[];
};

export type DispenseRecord = {
  id: string;
  status: string;
  createdAt: string;
  notes?: string | null;
  items: {
    id: string;
    quantity: number;
    prescriptionItem: {
      medicine: { name: string; strength?: string | null };
    };
  }[];
  pharmacyOrg?: { name: string };
};

export type LabResult = {
  id: string;
  createdAt: string;
  notes?: string | null;
  labTestType: { name: string };
  measures: {
    value: string;
    unit?: string | null;
    labMeasureDef: { name: string };
  }[];
  attachments?: {
    id: string;
    fileName: string;
    url: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
  }[];
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

export const updatePatientProfile = (
  patientProfileId: string,
  payload: { name?: string; dob?: string; location?: string },
) =>
  apiClient.patch<{ patient: PatientProfile }, typeof payload>(
    `/patients/${patientProfileId}`,
    payload,
  );

export type GuardianInvite = {
  id: string;
  patientId: string;
  email: string;
  token: string;
  status: string;
  expiresAt: string;
};

export const inviteGuardian = (patientProfileId: string, email: string) =>
  apiClient.post<{ invite: GuardianInvite }, { email: string }>(
    `/patients/${patientProfileId}/guardians/invite`,
    { email },
  );
