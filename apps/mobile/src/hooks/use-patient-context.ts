import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getGuardianPatients, getSelfPatientProfile, type PatientProfile } from "../lib/patient-records";

export const usePatientContext = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const selfQuery = useQuery({
    queryKey: ["patient-self"],
    queryFn: getSelfPatientProfile,
  });

  const guardianQuery = useQuery({
    queryKey: ["guardian-patients"],
    queryFn: getGuardianPatients,
  });

  const patients = useMemo(() => {
    const items: PatientProfile[] = [];
    const self = selfQuery.data?.ok ? selfQuery.data.data?.patient : undefined;
    if (self) {
      items.push(self);
    }
    const guardianPatients = guardianQuery.data?.ok
      ? guardianQuery.data.data?.patients ?? []
      : [];
    guardianPatients.forEach((patient) => {
      if (!items.find((item) => item.id === patient.id)) {
        items.push(patient);
      }
    });
    return items;
  }, [guardianQuery.data, selfQuery.data]);

  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  return {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    isLoading: selfQuery.isLoading || guardianQuery.isLoading,
  };
};
