import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Card } from "../../components/ui/card";
import { fetchLabTestTypes } from "../../lib/lab";

export const LabDashboardPage = () => {
  const testsQuery = useQuery({
    queryKey: ["lab-dashboard-test-types"],
    queryFn: () => fetchLabTestTypes(),
  });

  const labTests = testsQuery.data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Diagnostic laboratory console"
        subtitle="Manage diagnostic panels, enter patient measure values, and attach laboratory documents."
      />

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card title="Available diagnostic test types" eyebrow="Catalog">
          <p className="text-sm text-slate-500 mb-3">
            Standard diagnostic tests configured for specimen reporting.
          </p>
          {testsQuery.isLoading ? (
            <p className="text-xs text-slate-400">Loading catalog...</p>
          ) : labTests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 text-center">
              No lab test types configured yet.
            </div>
          ) : (
            <div className="space-y-2">
              {labTests.slice(0, 6).map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-sm"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{test.name}</span>
                    {test.code ? (
                      <span className="ml-2 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {test.code}
                      </span>
                    ) : null}
                  </div>
                  <Link
                    to="/lab/patients"
                    className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-ink hover:text-white transition"
                  >
                    Select Patient &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <Link to="/lab/patients" className="font-semibold text-tide hover:underline">
              Search Patient to Enter Results &rarr;
            </Link>
            <Link to="/root/lab-tests" className="text-slate-400 hover:text-ink">
              View Lab Catalog
            </Link>
          </div>
        </Card>

        <Card title="Laboratory workflow" eyebrow="Actions">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
              <span>Patient Lookup & Entry</span>
              <Link
                to="/lab/patients"
                className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Find Patient &rarr;
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
              <span>Test Definitions</span>
              <Link
                to="/root/lab-tests"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:text-ink transition"
              >
                Catalog
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
              <span>Define New Measures</span>
              <Link
                to="/root/lab-tests/measures"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:text-ink transition"
              >
                Measures
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Specimen recording" eyebrow="Diagnostics">
          Lookup patient by NIC to record specimen values against predefined test definitions and measures.
        </Card>
        <Card title="Automatic reference ranges" eyebrow="Safety">
          Normal minimum and maximum range thresholds are presented alongside each measure for quick clinical verification.
        </Card>
        <Card title="Document attachments" eyebrow="Reports">
          Upload PDF reports or scan images to attach directly to test result cards for physician inspection.
        </Card>
      </div>
    </div>
  );
};
