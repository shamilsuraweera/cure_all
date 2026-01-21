import { apiClient } from "./api-client";

export type OrgType = "HOSPITAL" | "CLINIC" | "PHARMACY" | "LAB";
export type OrgStatus = "ACTIVE" | "SUSPENDED";

export type Organization = {
  id: string;
  name: string;
  type: OrgType;
  domain?: string | null;
  status: OrgStatus;
  createdAt: string;
};

export type OrgInvite = {
  id: string;
  orgId: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: string;
};

export type PatientProfile = {
  id: string;
  userId: string;
  nic: string;
  name?: string | null;
  dob?: string | null;
  location?: string | null;
};

export type MedicineForm =
  | "TABLET"
  | "CAPSULE"
  | "SYRUP"
  | "INJECTION"
  | "CREAM"
  | "OTHER";

export type Medicine = {
  id: string;
  name: string;
  genericName?: string | null;
  strength?: string | null;
  form: MedicineForm;
  manufacturer?: string | null;
  notes?: string | null;
  isActive: boolean;
};

export type LabTestType = {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
};

export const fetchOrgs = (page = 1, pageSize = 20) =>
  apiClient.get<{ items: Organization[] }>("/admin/orgs", {
    query: { page, pageSize },
  });

export const createOrg = (payload: {
  name: string;
  type: OrgType;
  domain?: string | null;
}) => apiClient.post<{ org: Organization }, typeof payload>("/admin/orgs", payload);

export const updateOrgStatus = (orgId: string, status: OrgStatus) =>
  apiClient.patch<{ org: Organization }, { status: OrgStatus }>(
    `/admin/orgs/${orgId}`,
    { status },
  );

export const inviteOrgMember = (orgId: string, payload: { email: string; role: string }) =>
  apiClient.post<{ invite: OrgInvite }, typeof payload>(
    `/admin/orgs/${orgId}/invite`,
    payload,
  );

export const acceptOrgInvite = (payload: { token: string; password: string }) =>
  apiClient.post<{ userId: string }, typeof payload>("/invites/accept", payload);

export const createPatient = (payload: {
  email: string;
  password: string;
  nic: string;
  name?: string;
  dob?: string;
  location?: string;
  guardianEmail?: string;
}) => apiClient.post<{ patient: PatientProfile }, typeof payload>("/admin/patients", payload);

export const fetchMedicines = (page = 1, pageSize = 20, query = "") =>
  apiClient.get<{ items: Medicine[] }>("/medicines", {
    query: { page, pageSize, q: query || undefined },
  });

export const createMedicine = (payload: {
  name: string;
  genericName?: string;
  strength?: string;
  form: MedicineForm;
  manufacturer?: string;
  notes?: string;
}) => apiClient.post<{ medicine: Medicine }, typeof payload>("/admin/medicines", payload);

export const fetchLabTestTypes = (page = 1, pageSize = 20) =>
  apiClient.get<{ items: LabTestType[] }>("/admin/lab-test-types", {
    query: { page, pageSize },
  });

export const createLabTestType = (payload: {
  name: string;
  code?: string;
  description?: string;
}) =>
  apiClient.post<{ labTestType: LabTestType }, typeof payload>(
    "/admin/lab-test-types",
    payload,
  );

export const createLabMeasure = (labTestTypeId: string, payload: {
  name: string;
  unit?: string;
  normalRangeMin?: number;
  normalRangeMax?: number;
}) =>
  apiClient.post<{ measure: { id: string } }, typeof payload>(
    `/admin/lab-test-types/${labTestTypeId}/measures`,
    payload,
  );
