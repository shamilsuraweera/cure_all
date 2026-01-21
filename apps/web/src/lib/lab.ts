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

export type LabTestType = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
};

export type LabMeasureDef = {
  id: string;
  name: string;
  unit?: string | null;
  normalRangeMin?: number | null;
  normalRangeMax?: number | null;
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

export const fetchLabTestTypes = () =>
  apiClient.get<{ items: LabTestType[] }>("/lab-test-types");

export const fetchLabMeasures = (labTestTypeId: string) =>
  apiClient.get<{ items: LabMeasureDef[] }>(`/lab-test-types/${labTestTypeId}/measures`);

export const createLabResult = (
  patientProfileId: string,
  payload: {
    labTestTypeId: string;
    notes?: string;
    measures: Array<{ labMeasureDefId: string; value: string; unit?: string }>;
  },
) =>
  apiClient.post<{ labResult: LabResult }, typeof payload>(
    `/patients/${patientProfileId}/lab-results`,
    payload,
  );

export const fetchPatientLabResults = (patientProfileId: string) =>
  apiClient.get<{ labResults: LabResult[] }>(
    `/patients/${patientProfileId}/lab-results`,
  );

export const fetchLabResultDetail = (labResultId: string) =>
  apiClient.get<{ labResult: LabResult }>(`/lab-results/${labResultId}`);

export const uploadLabAttachment = (
  labResultId: string,
  payload: { fileName: string; url: string; mimeType?: string; sizeBytes?: number },
) =>
  apiClient.post<{ attachment: LabResult["attachments"][number] }, typeof payload>(
    `/lab-results/${labResultId}/attachments`,
    payload,
  );
