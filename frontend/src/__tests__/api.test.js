import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { analyzeEmail } from "../services/api";

const mockResponse = {
  verdict: "phishing",
  confidence: 92,
  summary: "High confidence phishing attempt.",
  red_flags: ["SPF fail", "CEO impersonation"],
  iocs: [{ type: "url", value: "https://evil.com", context: "phishing page" }],
  mitre_ttps: [{ technique_id: "T1566", technique_name: "Phishing", tactic: "Initial Access" }],
  recommendations: ["Quarantine email"],
  analyst_notes: null,
  processing_time_ms: 800,
  parsed_email: {},
};

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("analyzeEmail", () => {
  it("calls POST /api/v1/analyze with correct body", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await analyzeEmail("From: test@test.com\n\nBody");

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/analyze",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_email: "From: test@test.com\n\nBody" }),
      })
    );
  });

  it("returns parsed response on success", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await analyzeEmail("test email");
    expect(result.verdict).toBe("phishing");
    expect(result.confidence).toBe(92);
  });

  it("throws with detail message on non-200 response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({ detail: "raw_email must not be empty" }),
    });

    await expect(analyzeEmail("")).rejects.toThrow("raw_email must not be empty");
  });

  it("throws on 503 with detail message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ detail: "Claude API unreachable" }),
    });

    await expect(analyzeEmail("test")).rejects.toThrow("Claude API unreachable");
  });

  it("throws network error message when fetch rejects", async () => {
    global.fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(analyzeEmail("test")).rejects.toThrow(
      "Backend unavailable — is the server running?"
    );
  });

  it("falls back to statusText when response body has no detail", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({}),
    });

    await expect(analyzeEmail("test")).rejects.toThrow(/HTTP 500/);
  });
});
