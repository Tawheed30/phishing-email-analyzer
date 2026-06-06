import { render, screen } from "@testing-library/react";
import RedFlagsPanel from "../components/RedFlagsPanel";

describe("RedFlagsPanel", () => {
  it("renders without crashing", () => {
    render(<RedFlagsPanel flags={[]} />);
  });

  it("shows correct count in title when flags present", () => {
    const flags = ["SPF fail", "Reply-To mismatch", "Urgent subject line"];
    render(<RedFlagsPanel flags={flags} />);
    expect(screen.getByText(/red flags detected \(3\)/i)).toBeInTheDocument();
  });

  it("shows zero count when no flags", () => {
    render(<RedFlagsPanel flags={[]} />);
    expect(screen.getByText(/red flags detected \(0\)/i)).toBeInTheDocument();
  });

  it("renders each flag text", () => {
    const flags = ["SPF fail", "Reply-To mismatch"];
    render(<RedFlagsPanel flags={flags} />);
    expect(screen.getByText("SPF fail")).toBeInTheDocument();
    expect(screen.getByText("Reply-To mismatch")).toBeInTheDocument();
  });

  it("shows green empty state message when no flags", () => {
    render(<RedFlagsPanel flags={[]} />);
    expect(screen.getByText(/no red flags detected/i)).toBeInTheDocument();
  });

  it("does not show empty state when flags present", () => {
    render(<RedFlagsPanel flags={["SPF fail"]} />);
    expect(screen.queryByText(/no red flags detected/i)).not.toBeInTheDocument();
  });

  it("renders correct number of flag items", () => {
    const flags = ["Flag A", "Flag B", "Flag C", "Flag D"];
    render(<RedFlagsPanel flags={flags} />);
    expect(screen.getByText(/\(4\)/)).toBeInTheDocument();
    expect(screen.getByText("Flag A")).toBeInTheDocument();
    expect(screen.getByText("Flag D")).toBeInTheDocument();
  });
});
