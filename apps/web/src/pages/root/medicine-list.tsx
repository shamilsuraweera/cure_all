import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { fetchMedicines } from "../../lib/root-admin";

export const MedicineListPage = () => {
  const [query, setQuery] = useState("");
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["medicines", page, query],
    queryFn: () => fetchMedicines(page, 20, query),
  });

  const medicines = data?.data?.items ?? [];

  return (
    <div>
      <SectionHeader
        title="Medicines catalog"
        subtitle="Search and review medicines available for prescriptions."
      />
      <Card title="Catalog" eyebrow="Root admin">
        <div className="mb-4">
          <Input
            label="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or generic name"
          />
        </div>
        {isLoading ? (
          <p>Loading medicines...</p>
        ) : (
          <div className="space-y-3">
            {medicines.length === 0 ? <p>No medicines found.</p> : null}
            {medicines.map((medicine) => (
              <div
                key={medicine.id}
                className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-800">{medicine.name}</p>
                    <p className="text-xs text-slate-400">
                      {medicine.form} · {medicine.strength ?? ""}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      medicine.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {medicine.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
