import { useMemo } from "react";

import { usePatientContext } from "../hooks/use-patient-context";
import { useAuth } from "./auth-context";

export type Roles = {
  isRoot: boolean;
  isDoctor: boolean;
  isPharmacist: boolean;
  isLabTech: boolean;
  isPatient: boolean;
  isGuardian: boolean;
  /** Doctor, pharmacist, lab tech or root admin. */
  isStaff: boolean;
  /** Patient or guardian: has records to browse. */
  hasRecords: boolean;
};

/**
 * Role resolution mirrors the backend: root is a global role, staff roles come
 * from org memberships, and patient/guardian are inferred from profile links.
 * Root admin passes every staff check except pharmacy dispensing (backend rule).
 */
export const useRoles = (): Roles => {
  const { user } = useAuth();
  const { isPatient, isGuardian } = usePatientContext();

  return useMemo(() => {
    const isRoot = user?.globalRole === "ROOT_ADMIN";
    const has = (role: string) => Boolean(user?.orgRoles?.includes(role));
    const isDoctor = isRoot || has("DOCTOR");
    const isPharmacist = isRoot || has("PHARMACIST");
    const isLabTech = isRoot || has("LAB_TECH");
    return {
      isRoot,
      isDoctor,
      isPharmacist,
      isLabTech,
      isPatient,
      isGuardian,
      isStaff: isDoctor || isPharmacist || isLabTech,
      hasRecords: isPatient || isGuardian,
    };
  }, [user, isPatient, isGuardian]);
};
