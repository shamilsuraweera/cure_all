import request from "supertest";
import crypto from "crypto";

import app from "../app.js";

const getCookieHeader = (res: request.Response) =>
  (res.headers["set-cookie"] || []).map((cookie) => cookie.split(";")[0]).join("; ");

describe("auth endpoints", () => {
  it("POST /auth/login sets cookies", async () => {
    const res = await request(app).post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    const cookieHeader = getCookieHeader(res);
    expect(cookieHeader).toContain("access_token=");
    expect(cookieHeader).toContain("refresh_token=");
  });

  it("POST /auth/refresh rotates cookies", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    const cookieHeader = getCookieHeader(loginRes);

    const res = await request(app)
      .post("/auth/refresh")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /auth/logout clears cookies", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    const cookieHeader = getCookieHeader(loginRes);

    const res = await request(app)
      .post("/auth/logout")
      .set("Cookie", cookieHeader);

    expect(res.status).toBe(200);
    const cookies = (res.headers["set-cookie"] || []).join(";");
    expect(cookies).toContain("access_token=;");
    expect(cookies).toContain("refresh_token=;");
  });

  it("POST /admin/patients creates a patient", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    const cookieHeader = getCookieHeader(loginRes);
    const nic = String(200000000000 + Math.floor(Math.random() * 1000000000));

    const res = await request(app)
      .post("/admin/patients")
      .set("Cookie", cookieHeader)
      .send({
        email: `patient_${crypto.randomUUID()}@example.com`,
        password: "PatientPass123",
        nic,
      });

    expect(res.status).toBe(201);
    expect(res.body.patient).toBeDefined();
  });
});
