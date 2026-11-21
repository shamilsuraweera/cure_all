import request from "supertest";

import app from "../app.js";

describe("device token endpoints", () => {
  it("registers and unregisters an Expo push token", async () => {
    const agent = request.agent(app);
    await agent.post("/auth/login").send({
      email: process.env.ROOT_ADMIN_EMAIL,
      password: process.env.ROOT_ADMIN_PASSWORD,
    });

    const token = `ExponentPushToken[test-${Date.now()}]`;

    const bad = await agent
      .post("/devices")
      .send({ token: "not-a-token", platform: "android" });
    expect(bad.status).toBe(400);

    const ok = await agent.post("/devices").send({ token, platform: "android" });
    expect(ok.status).toBe(200);

    const again = await agent.post("/devices").send({ token, platform: "ios" });
    expect(again.status).toBe(200);

    const removed = await agent.post("/devices/unregister").send({ token });
    expect(removed.status).toBe(200);
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .post("/devices")
      .send({ token: "ExponentPushToken[x]", platform: "android" });
    expect(res.status).toBe(401);
  });
});
