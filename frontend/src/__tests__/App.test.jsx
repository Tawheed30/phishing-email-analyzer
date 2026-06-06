import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";

vi.mock("../services/api", () => ({
  analyzeEmail: vi.fn(),
}));

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
  });

  it("shows the email textarea", () => {
    render(<App />);
    expect(screen.getByTestId("email-textarea")).toBeInTheDocument();
  });

  it("shows the ANALYZE THREAT button", () => {
    render(<App />);
    expect(screen.getByTestId("analyze-button")).toBeInTheDocument();
    expect(screen.getByTestId("analyze-button")).toHaveTextContent(/analyze threat/i);
  });

  it("shows the navbar brand", () => {
    render(<App />);
    expect(screen.getAllByText(/phish/i).length).toBeGreaterThan(0);
  });

  it("does not show error banner initially", () => {
    render(<App />);
    expect(screen.queryByTestId("error-banner")).not.toBeInTheDocument();
  });

  it("does not show verdict banner initially", () => {
    render(<App />);
    expect(screen.queryByTestId("verdict-banner")).not.toBeInTheDocument();
  });
});
