import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CopyReportButton, { formatReport } from "../components/CopyReportButton";

const parsedEmail = {
  from_address: "ceo@evil.com",
  from_display_name: "CEO",
  to_addresses: ["cfo@target.com"],
  reply_to: null,
  subject: "URGENT Wire Transfer",
  date: "2024-06-05T08:00:00Z",
  message_id: null,
  return_path: null,
  received_hops: [],
  authentication: {
    spf: { status: "fail", detail: "spf=fail" },
    dkim: { status: "fail", detail: "dkim=fail" },
    dmarc: { status: "fail", detail: "dmarc=fail" },
  },
  plain_text_body: "Wire money now",
  html_body: null,
  urls: ["https://evil.com/wire"],
  attachments: [{ filename: "Invoice.pdf", mime_type: "application/pdf" }],
  suspicious_flags: {
    reply_to_mismatch: false,
    display_name_mismatch: false,
    missing_message_id: true,
    missing_date: false,
    suspicious_received_chain: false,
  },
};

const mockReport = {
  verdict: "phishing",
  confidence: 95,
  summary: "High confidence BEC attack.",
  red_flags: ["SPF fail", "Missing Message-ID"],
  iocs: [{ type: "url", value: "https://evil.com/wire", context: "wire fraud" }],
  mitre_ttps: [{ technique_id: "T1566", technique_name: "Phishing", tactic: "Initial Access" }],
  recommendations: ["Quarantine email", "Block evil.com"],
  analyst_notes: "BEC wire fraud.",
  processing_time_ms: 1500,
  parsed_email: parsedEmail,
};

const mockWriteText = vi.fn().mockResolvedValue(undefined);

beforeAll(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
});

beforeEach(() => mockWriteText.mockClear());

describe("CopyReportButton", () => {
  it("renders the copy button", () => {
    render(<CopyReportButton report={mockReport} />);
    expect(screen.getByTestId("copy-report-button")).toBeInTheDocument();
  });

  it("shows copy label initially", () => {
    render(<CopyReportButton report={mockReport} />);
    expect(screen.getByText(/copy report/i)).toBeInTheDocument();
  });

  it("button is accessible via testid and clickable", async () => {
    const user = userEvent.setup();
    render(<CopyReportButton report={mockReport} />);
    const btn = screen.getByTestId("copy-report-button");
    expect(btn).toBeInTheDocument();
    await user.click(btn); // should not throw
  });

  it("shows copied confirmation after click", async () => {
    const user = userEvent.setup();
    render(<CopyReportButton report={mockReport} />);
    await user.click(screen.getByTestId("copy-report-button"));
    expect(await screen.findByText(/report copied/i)).toBeInTheDocument();
  });
});

describe("formatReport", () => {
  it("includes verdict in output", () => {
    const text = formatReport(mockReport);
    expect(text).toContain("PHISHING");
  });

  it("includes confidence in output", () => {
    const text = formatReport(mockReport);
    expect(text).toContain("95%");
  });

  it("includes IOC values", () => {
    const text = formatReport(mockReport);
    expect(text).toContain("https://evil.com/wire");
  });

  it("includes MITRE technique", () => {
    const text = formatReport(mockReport);
    expect(text).toContain("T1566");
  });

  it("includes from address", () => {
    const text = formatReport(mockReport);
    expect(text).toContain("ceo@evil.com");
  });

  it("includes subject", () => {
    const text = formatReport(mockReport);
    expect(text).toContain("URGENT Wire Transfer");
  });
});
