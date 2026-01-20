import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../index";
describe("api client", () => {
    it("handles success responses", async () => {
        const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: { ok: true } }), { status: 200 }));
        const client = createApiClient({
            baseUrl: "http://localhost:3000",
            fetcher,
            authMode: "cookie",
        });
        const result = await client.get("/health");
        expect(result.ok).toBe(true);
        expect(result.data?.ok).toBe(true);
    });
    it("retries on 401 with refresh", async () => {
        const responses = [
            new Response(JSON.stringify({ error: { message: "unauthorized" } }), {
                status: 401,
            }),
            new Response(JSON.stringify({ data: { message: "refreshed" } }), {
                status: 200,
            }),
            new Response(JSON.stringify({ data: { message: "ok" } }), { status: 200 }),
        ];
        const fetcher = vi.fn(async () => responses.shift() ?? responses[0]);
        const client = createApiClient({
            baseUrl: "http://localhost:3000",
            fetcher,
            authMode: "cookie",
        });
        const result = await client.post("/auth/login");
        expect(fetcher).toHaveBeenCalled();
        expect(result.ok).toBe(true);
    });
});
