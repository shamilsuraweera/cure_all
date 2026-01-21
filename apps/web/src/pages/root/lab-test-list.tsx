import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Card } from "../../components/ui/card";
import { fetchLabTestTypes } from "../../lib/root-admin";

export const LabTestListPage = () => {
  const [page] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["lab-test-types", page],
    queryFn: () => fetchLabTestTypes(page),
  });

  const items = data?.data?.items ?? [];

  return (
    <div>
      <SectionHeader
        title="Lab test types"
        subtitle="Review and manage the diagnostic catalog."
      />
      <Card title="Lab catalog" eyebrow="Root admin">
        {isLoading ? (
          <p>Loading lab tests...</p>
        ) : (
          <div className="space-y-3">
            {items.length === 0 ? <p>No lab tests found.</p> : null}
            {items.map((test) => (
              <div
                key={test.id}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <p className="font-medium text-slate-800">{test.name}</p>
                <p className="text-xs text-slate-400">
                  {test.code ?? "No code"} · {test.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
