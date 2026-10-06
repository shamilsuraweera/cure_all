import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { fetchLabTestTypes } from "../../lib/root-admin";

export const LabTestListPage = () => {
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["lab-test-types", page],
    queryFn: () => fetchLabTestTypes(page),
  });

  const items = data?.data?.items ?? [];

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader
          title="Lab test types"
          subtitle="Review and configure diagnostic procedures and measurement templates."
        />
        <div className="flex gap-2">
          <Link
            to="/root/lab-tests/create"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-slate-800 transition"
          >
            + Create Test Type
          </Link>
          <Link
            to="/root/lab-tests/measures"
            className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-ink transition"
          >
            + Define Measures
          </Link>
        </div>
      </div>

      <Card title="Lab catalog" eyebrow="Root admin">
        <div className="mb-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lab tests by name or code..."
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-400">Loading lab tests...</p>
        ) : (
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No lab tests found matching your search.
              </div>
            ) : null}
            {filteredItems.map((test) => (
              <div
                key={test.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{test.name}</p>
                    {test.code ? (
                      <span className="font-mono text-xs rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                        {test.code}
                      </span>
                    ) : null}
                  </div>
                  {test.description ? (
                    <p className="mt-1 text-xs text-slate-500">{test.description}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      test.isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {test.isActive ? "Active" : "Inactive"}
                  </span>
                  <Link
                    to={`/root/lab-tests/measures?labTestTypeId=${test.id}`}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                  >
                    + Add Measure
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
