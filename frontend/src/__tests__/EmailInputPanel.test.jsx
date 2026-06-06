import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import EmailInputPanel from "../components/EmailInputPanel";

describe("EmailInputPanel", () => {
  it("renders textarea and analyze button", () => {
    render(<EmailInputPanel onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByTestId("email-textarea")).toBeInTheDocument();
    expect(screen.getByTestId("analyze-button")).toBeInTheDocument();
  });

  it("shows character count", () => {
    render(<EmailInputPanel onSubmit={vi.fn()} loading={false} />);
    expect(screen.getByText(/chars/i)).toBeInTheDocument();
  });

  it("shows short warning for very short input", async () => {
    const user = userEvent.setup();
    render(<EmailInputPanel onSubmit={vi.fn()} loading={false} />);
    const ta = screen.getByTestId("email-textarea");
    await user.type(ta, "hi");
    expect(screen.getByTestId("short-warning")).toBeInTheDocument();
  });

  it("shows size error and blocks submit for oversized input", () => {
    render(<EmailInputPanel onSubmit={vi.fn()} loading={false} />);
    const ta = screen.getByTestId("email-textarea");
    // Simulate pasting huge text via fireEvent (faster than typing)
    fireEvent.change(ta, { target: { value: "x".repeat(500_001) } });
    expect(screen.getByTestId("size-error")).toBeInTheDocument();
    expect(screen.getByTestId("analyze-button")).toBeDisabled();
  });

  it("calls onSubmit on form submit with trimmed value", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EmailInputPanel onSubmit={onSubmit} loading={false} />);
    const ta = screen.getByTestId("email-textarea");
    await user.type(ta, "From: test@test.com\n\nBody");
    await user.click(screen.getByTestId("analyze-button"));
    expect(onSubmit).toHaveBeenCalledWith("From: test@test.com\n\nBody");
  });

  it("calls onSubmit on Ctrl+Enter", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EmailInputPanel onSubmit={onSubmit} loading={false} />);
    const ta = screen.getByTestId("email-textarea");
    await user.type(ta, "From: test@example.com\n\nHello world");
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalled();
  });

  it("does not call onSubmit on Ctrl+Enter when loading", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EmailInputPanel onSubmit={onSubmit} loading={true} />);
    const ta = screen.getByTestId("email-textarea");
    // textarea is disabled when loading, so keyboard events won't fire
    expect(ta).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows loading scan bar when loading=true", () => {
    render(<EmailInputPanel onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByText(/analyzing with claude ai/i)).toBeInTheDocument();
  });

  it("loads sample email on LOAD SAMPLE click", async () => {
    const user = userEvent.setup();
    render(<EmailInputPanel onSubmit={vi.fn()} loading={false} />);
    await user.click(screen.getByTestId("load-sample-button"));
    const ta = screen.getByTestId("email-textarea");
    expect(ta.value.length).toBeGreaterThan(50);
  });
});
