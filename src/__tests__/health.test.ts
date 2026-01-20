import request from "supertest";
import app from "../app.js";

describe("health endpoints", () => {
  it("GET / responds with status message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Cure-All API running" });
  });

  it("GET /health responds with OK status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "OK" });
  });
});
