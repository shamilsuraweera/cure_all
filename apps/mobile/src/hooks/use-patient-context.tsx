import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "../auth/auth-context";
import {
  getGuardianPatients,
  getSelfPatientProfile,
  type PatientProfile,
} from "../lib/patient-records";

type PatientContextValue = {
  patients: PatientProfile[];
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string) => void;
  isLoading: boolean;
  /** True when the signed-in user has their own patient profile. */
  isPatient: boolean;
  /** True when the signed-in user is an active guardian of someone else. */
  isGuardian: boolean;
  refetch: () => Promise<unknown>;
};

const PatientContext = createContext<PatientContextValue | null>(null);

export const PatientContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

  const selfQuery = useQuery({
    queryKey: ["patient-self", user?.id],
    queryFn: getSelfPatientProfile,
    enabled: isAuthenticated,
  });

  const guardianQuery = useQuery({
    queryKey: ["guardian-patients", user?.id],
    queryFn: getGuardianPatients,
    enabled: isAuthenticated,
  });

  const patients = useMemo(() => {
    const items: PatientProfile[] = [];
    const self = selfQuery.data?.ok ? selfQuery.data.data?.patient : undefined;
    if (self) items.push(self);
    const guardianPatients = guardianQuery.data?.ok
      ? (guardianQuery.data.data?.patients ?? [])
      : [];
    guardianPatients.forEach((patient) => {
      if (!items.find((item) => item.id === patient.id)) items.push(patient);
    });
    return items;
  }, [guardianQuery.data, selfQuery.data]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedPatientId(null);
      return;
    }
    if (
      patients.length > 0 &&
      !patients.some((p) => p.id === selectedPatientId)
    ) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId, isAuthenticated]);

  const value = useMemo<PatientContextValue>(
    () => ({
      patients,
      selectedPatientId,
      setSelectedPatientId,
      isLoading:
        isAuthenticated && (selfQuery.isLoading || guardianQuery.isLoading),
      isPatient: patients.some((p) => p.userId === user?.id),
      isGuardian: patients.some((p) => p.userId !== user?.id),
      refetch: () =>
        Promise.all([selfQuery.refetch(), guardianQuery.refetch()]),
    }),
    [
      patients,
      selectedPatientId,
      isAuthenticated,
      selfQuery,
      guardianQuery,
      user?.id,
    ],
  );

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const ctx = useContext(PatientContext);
  if (!ctx)
    throw new Error(
      "usePatientContext must be used within PatientContextProvider",
    );
  return ctx;
};
