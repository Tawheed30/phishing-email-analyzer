import { render, screen } from "@testing-library/react";
import VerdictBanner from "../components/VerdictBanner";

const parsedEmail = {
  from_address: "test@test.com",
  from_display_name: null,
  to_addresses: [],
  reply_to: null,
  subject: "Test",
  date: null,
  message_id: null,
  return_path: null,
  received_hops: [],
  authentication: {
    spf: { status: "none", detail: "" },
    dkim: { status: "none", detail: "" },
    dmarc: { status: "none", detail: "" },
  },
  plain_text_body: null,
  html_body: null,
  urls: [],
  attachments: [],
  suspicious_flags: {
    reply_to_mismatch: false,
    display_name_mismatch: false,
    missing_message_id: false,
    missing_date: false,
    suspicious_received_chain: false,
  },
};

function makeReport(verdict, confidence = 80) {
  return {
    verdict,
    confidence,
    processing_time_ms: 1200,
    summary: "Test summary",
    red_flags: [],
    iocs: [],
    mitre_ttps: [],
    recommendations: [],
    analyst_notes: null,
    parsed_email: parsedEmail,
  };
}

describe("VerdictBanner", () => {
  it("renders phishing verdict text", () => {
    render(<VerdictBanner report={makeReport("phishing", 95)} />);
    expect(screen.getByText(/phishing detected/i)).toBeInTheDocument();
  });

  it("applies phishing glow class for phishing verdict", () => {
    render(<VerdictBanner report={makeReport("phishing")} />);
    const banner = screen.getByTestId("verdict-banner");
    expect(banner).toHaveAttribute("data-verdict", "phishing");
    expect(banner.className).toContain("verdict-phishing");
  });

  it("applies clean glow class for clean verdict", () => {
    render(<VerdictBanner report={makeReport("clean", 5)} />);
    const banner = screen.getByTestId("verdict-banner");
    expect(banner).toHaveAttribute("data-verdict", "clean");
    expect(banner.className).toContain("verdict-clean");
  });

  it("applies suspicious class for suspicious verdict", () => {
    render(<VerdictBanner report={makeReport("suspicious", 60)} />);
    const banner = screen.getByTestId("verdict-banner");
    expect(banner.className).toContain("verdict-suspicious");
  });

  it("shows confidence percentage", () => {
    render(<VerdictBanner report={makeReport("phishing", 92)} />);
    expect(screen.getByText("92%")).toBeInTheDocument();
  });

  it("shows processing time", () => {
    render(<VerdictBanner report={makeReport("clean", 10)} />);
    expect(screen.getByText(/analyzed in/i)).toBeInTheDocument();
  });

  it("shows CLEAN text for clean verdict", () => {
    render(<VerdictBanner report={makeReport("clean")} />);
    expect(screen.getByText(/✓ clean/i)).toBeInTheDocument();
  });

  it("shows SUSPICIOUS text for suspicious verdict", () => {
    render(<VerdictBanner report={makeReport("suspicious")} />);
    expect(screen.getByText(/suspicious/i)).toBeInTheDocument();
  });
});
