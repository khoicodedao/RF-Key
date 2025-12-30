// __tests__/license-form.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LicenseFormDialog } from "../license-form";

describe("LicenseFormDialog", () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onOpenChange = jest.fn();

    const renderComponent = (props = {}) => {
        render(
            <LicenseFormDialog
                open={true}
                onOpenChange={onOpenChange}
                onSubmit={onSubmit}
                {...props}
            />
        );
    };

    it("renders required fields and validates them", async () => {
        renderComponent();
        // License field required
        const licenseInput = screen.getByLabelText(/License/i) as HTMLInputElement;
        fireEvent.change(licenseInput, { target: { value: "" } });
        fireEvent.blur(licenseInput);
        await waitFor(() => {
            expect(screen.getByText(/Bắt buộc/)).toBeInTheDocument();
        });

        // Fill valid license
        fireEvent.change(licenseInput, { target: { value: "LIC-001" } });
        fireEvent.blur(licenseInput);
        expect(screen.queryByText(/Bắt buộc/)).not.toBeInTheDocument();

        // Unit code required
        const unitCodeInput = screen.getByLabelText(/Unit code/i) as HTMLInputElement;
        fireEvent.change(unitCodeInput, { target: { value: "" } });
        fireEvent.blur(unitCodeInput);
        await waitFor(() => {
            expect(screen.getByText(/Bắt buộc/)).toBeInTheDocument();
        });
        fireEvent.change(unitCodeInput, { target: { value: "U001" } });
        fireEvent.blur(unitCodeInput);
        expect(screen.queryByText(/Bắt buộc/)).not.toBeInTheDocument();
    });

    it("validates MAC and IP formats", async () => {
        renderComponent();
        const macInput = screen.getByLabelText(/MAC/i) as HTMLInputElement;
        fireEvent.change(macInput, { target: { value: "invalid-mac" } });
        fireEvent.blur(macInput);
        await waitFor(() => {
            expect(screen.getByText(/MAC không hợp lệ/)).toBeInTheDocument();
        });
        fireEvent.change(macInput, { target: { value: "AA:BB:CC:DD:EE:FF" } });
        fireEvent.blur(macInput);
        expect(screen.queryByText(/MAC không hợp lệ/)).not.toBeInTheDocument();

        const ipInput = screen.getByLabelText(/IP/i) as HTMLInputElement;
        fireEvent.change(ipInput, { target: { value: "999.999.999.999" } });
        fireEvent.blur(ipInput);
        await waitFor(() => {
            expect(screen.getByText(/IP không hợp lệ/)).toBeInTheDocument();
        });
        fireEvent.change(ipInput, { target: { value: "192.168.1.1" } });
        fireEvent.blur(ipInput);
        expect(screen.queryByText(/IP không hợp lệ/)).not.toBeInTheDocument();
    });

    it("submits valid data", async () => {
        renderComponent();
        // Fill required fields
        fireEvent.change(screen.getByLabelText(/License/i), { target: { value: "LIC-123" } });
        fireEvent.change(screen.getByLabelText(/Unit code/i), { target: { value: "U001" } });
        fireEvent.change(screen.getByLabelText(/Region/i), { target: { value: "bac" } });
        // Submit
        fireEvent.click(screen.getByRole("button", { name: /Lưu/i }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
