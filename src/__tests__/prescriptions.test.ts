import request from "supertest";

import app from "../app.js";

describe("prescriptions endpoints", () => {
  it("creates and reads prescriptions for a patient", async () => {
    const agent = request.agent(app);

    await agent.post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    const medicineRes = await agent.post("/admin/medicines").send({
      name: "Paracetamol",
      form: "TABLET",
      strength: "500mg",
    });

    expect(medicineRes.status).toBe(201);
    const medicineId = medicineRes.body.medicine.id as string;

    const patientRes = await agent.post("/admin/patients").send({
      email: `patient_${Date.now()}@example.com`,
      password: "PatientPass123",
      nic: String(200000000000 + Math.floor(Math.random() * 1000000000)),
    });

    expect(patientRes.status).toBe(201);
    const patientProfileId = patientRes.body.patient.id as string;

    const createRes = await agent
      .post(`/patients/${patientProfileId}/prescriptions`)
      .send({
        notes: "Take after meals",
        items: [
          {
            medicineId,
            dose: "1 tablet",
            frequency: "2x daily",
            durationDays: 5,
            quantity: 10,
          },
        ],
      });

    expect(createRes.status).toBe(201);
    const prescriptionId = createRes.body.prescription.id as string;

    const listRes = await agent.get(
      `/patients/${patientProfileId}/prescriptions`,
    );

    expect(listRes.status).toBe(200);
    expect(listRes.body.prescriptions.length).toBeGreaterThan(0);

    const detailRes = await agent.get(`/patients/prescriptions/${prescriptionId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.prescription.id).toBe(prescriptionId);

    const immutabilityRes = await agent.patch(
      `/patients/prescriptions/${prescriptionId}`,
    );
    expect(immutabilityRes.status).toBe(405);
  });
});
