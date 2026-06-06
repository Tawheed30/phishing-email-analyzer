import { render, screen } from "@testing-library/react";
import WelcomeState from "../components/WelcomeState";

describe("WelcomeState", () => {
  it("renders without crashing", () => {
    render(<WelcomeState />);
  });

  it("shows ready for analysis heading", () => {
    render(<WelcomeState />);
    expect(screen.getByText(/ready for analysis/i)).toBeInTheDocument();
  });

  it("has data-testid for testing", () => {
    render(<WelcomeState />);
    expect(screen.getByTestId("welcome-state")).toBeInTheDocument();
  });

  it("mentions Ctrl+Enter shortcut", () => {
    render(<WelcomeState />);
    expect(screen.getByText(/ctrl/i)).toBeInTheDocument();
  });

  it("shows feature cards", () => {
    render(<WelcomeState />);
    expect(screen.getByText(/header parsing/i)).toBeInTheDocument();
    expect(screen.getByText(/claude ai analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/threat report/i)).toBeInTheDocument();
  });
});
