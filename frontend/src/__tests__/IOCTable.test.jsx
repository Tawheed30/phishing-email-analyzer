import { render, screen } from "@testing-library/react";
import IOCTable from "../components/IOCTable";

const mockIocs = [
  { type: "url", value: "http://evil.com/steal", context: "credential harvesting page" },
  { type: "domain", value: "evil.com", context: "attacker-controlled domain" },
  { type: "ip", value: "198.51.100.99", context: "C2 server IP" },
];

describe("IOCTable", () => {
  it("renders without crashing", () => {
    render(<IOCTable iocs={[]} />);
  });

  it("shows empty state when no IOCs", () => {
    render(<IOCTable iocs={[]} />);
    expect(screen.getByText(/no iocs identified/i)).toBeInTheDocument();
  });

  it("renders correct number of data rows", () => {
    render(<IOCTable iocs={mockIocs} />);
    const rows = screen.getAllByRole("row");
    // 1 header + 3 data rows
    expect(rows).toHaveLength(4);
  });

  it("renders url type badge", () => {
    render(<IOCTable iocs={mockIocs} />);
    expect(screen.getByText("url")).toBeInTheDocument();
  });

  it("renders domain type badge", () => {
    render(<IOCTable iocs={mockIocs} />);
    expect(screen.getByText("domain")).toBeInTheDocument();
  });

  it("renders ip type badge", () => {
    render(<IOCTable iocs={mockIocs} />);
    expect(screen.getByText("ip")).toBeInTheDocument();
  });

  it("renders IOC values", () => {
    render(<IOCTable iocs={mockIocs} />);
    expect(screen.getByText("http://evil.com/steal")).toBeInTheDocument();
    expect(screen.getByText("evil.com")).toBeInTheDocument();
    expect(screen.getByText("198.51.100.99")).toBeInTheDocument();
  });

  it("renders context text", () => {
    render(<IOCTable iocs={mockIocs} />);
    expect(screen.getByText("credential harvesting page")).toBeInTheDocument();
  });

  it("renders table column headers", () => {
    render(<IOCTable iocs={mockIocs} />);
    expect(screen.getByText(/type/i)).toBeInTheDocument();
    expect(screen.getByText(/value/i)).toBeInTheDocument();
    expect(screen.getByText(/context/i)).toBeInTheDocument();
  });
});
