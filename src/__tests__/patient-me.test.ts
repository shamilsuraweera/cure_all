import request from "supertest";

import app from "../app.js";

describe("GET /patients/me", () => {
  it("returns the signed-in patient's own profile", async () => {
    const admin = request.agent(app);
    await admin.post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    const email = `me_${Date.now()}@example.com`;
    const created = await admin.post("/admin/patients").send({
      email,
      password: "PatientPass123",
      nic: String(200000000000 + Math.floor(Math.random() * 1000000000)),
    });
    expect(created.status).toBe(201);

    const patient = request.agent(app);
    const login = await patient
      .post("/auth/login")
      .send({ email, password: "PatientPass123" });
    expect(login.status).toBe(200);

    const res = await patient.get("/patients/me");
    expect(res.status).toBe(200);
    expect(res.body.data.patient.id).toBe(created.body.data.patient.id);
  });
});
