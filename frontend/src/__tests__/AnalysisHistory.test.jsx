import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AnalysisHistory from "../components/AnalysisHistory";

const makeEntry = (i, verdict = "phishing") => ({
  id: String(i),
  timestamp: new Date().toISOString(),
  subject: `Test Email ${i}`,
  from_address: `sender${i}@evil.com`,
  verdict,
  confidence: 90 - i * 5,
  report: {},
});

describe("AnalysisHistory", () => {
  it("renders nothing when history is empty", () => {
    const { container } = render(<AnalysisHistory history={[]} onRestore={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows analysis-history testid when entries exist", () => {
    render(<AnalysisHistory history={[makeEntry(1)]} onRestore={vi.fn()} />);
    expect(screen.getByTestId("analysis-history")).toBeInTheDocument();
  });

  it("shows correct entry count in header", () => {
    const entries = [makeEntry(1), makeEntry(2), makeEntry(3)];
    render(<AnalysisHistory history={entries} onRestore={vi.fn()} />);
    expect(screen.getByText(/3\/5/)).toBeInTheDocument();
  });

  it("renders each entry subject", () => {
    const entries = [makeEntry(1), makeEntry(2)];
    render(<AnalysisHistory history={entries} onRestore={vi.fn()} />);
    expect(screen.getByText("Test Email 1")).toBeInTheDocument();
    expect(screen.getByText("Test Email 2")).toBeInTheDocument();
  });

  it("calls onRestore with correct entry when clicked", async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn();
    const entry = makeEntry(1, "suspicious");
    render(<AnalysisHistory history={[entry]} onRestore={onRestore} />);
    await user.click(screen.getByTestId(`history-entry-${entry.id}`));
    expect(onRestore).toHaveBeenCalledWith(entry);
  });

  it("renders verdict badge for each entry", () => {
    const entries = [makeEntry(1, "phishing"), makeEntry(2, "clean")];
    render(<AnalysisHistory history={entries} onRestore={vi.fn()} />);
    expect(screen.getByText("phishing")).toBeInTheDocument();
    expect(screen.getByText("clean")).toBeInTheDocument();
  });

  it("shows confidence percentage", () => {
    render(<AnalysisHistory history={[makeEntry(1, "phishing")]} onRestore={vi.fn()} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });
});
