import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../../components/root/section-header";
import { Card } from "../../components/ui/card";
import { listPrescriptions } from "../../lib/pharmacy";

export const PharmacyDashboardPage = () => {
  const queueQuery = useQuery({
    queryKey: ["pharmacy-dashboard-queue"],
    queryFn: () => listPrescriptions({ pageSize: 5 }),
  });

  const recentPrescriptions = queueQuery.data?.data?.prescriptions ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pharmacy dispensing console"
        subtitle="Verify electronic prescriptions, prevent over-dispensing, and record batch transactions."
      />

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card title="Pending prescription queue" eyebrow="Immediate action">
          <p className="text-sm text-slate-500 mb-3">
            Recent prescription orders awaiting dispensing validation.
          </p>
          {queueQuery.isLoading ? (
            <p className="text-xs text-slate-400">Loading queue...</p>
          ) : recentPrescriptions.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No pending prescriptions in the queue.</p>
          ) : (
            <div className="space-y-2.5">
              {recentPrescriptions.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {p.items.map((i) => i.medicine.name).join(", ")}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {p.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      ID: {p.id.slice(0, 16)}... · {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/pharmacy/prescriptions/${p.id}`}
                    className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
                  >
                    Dispense &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/pharmacy/prescriptions"
              className="text-xs font-semibold text-tide hover:underline"
            >
              Open Full Dispensing Directory &rarr;
            </Link>
          </div>
        </Card>

        <Card title="Dispensing guidelines" eyebrow="Clinical safety">
          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
              <span>
                <strong>Verification Step:</strong> Every prescription is verified against the database to guarantee it has not been cancelled or fully dispensed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
              <span>
                <strong>Partial Dispensing:</strong> If stock is low, record partial quantities. The remaining balance remains active for later fulfillment.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
              <span>
                <strong>Over-dispense Guard:</strong> The system strictly rejects attempts to dispense greater quantities than prescribed.
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Prescription verification" eyebrow="Workflow">
          Lookup by ID or barcode to inspect authorized medicine names, dosages, duration, and instructions.
        </Card>
        <Card title="Over-dispense safeguard" eyebrow="Safety">
          Line-item tracking ensures each medication item cannot exceed the doctor-authorized total quantity.
        </Card>
        <Card title="Audit history" eyebrow="Traceability">
          Each dispense event documents dispensing pharmacist, pharmacy organization ID, and timestamp.
        </Card>
      </div>
    </div>
  );
};
