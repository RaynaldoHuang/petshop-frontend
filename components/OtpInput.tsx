"use client";

import { ClipboardEvent, KeyboardEvent, useRef } from "react";

type OtpInputProps = {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
};

export default function OtpInput({
    value,
    onChange,
    length = 6,
    disabled = false,
}: OtpInputProps) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const chars = value.replace(/\D/g, "").slice(0, length).split("");

    function focusInput(index: number) {
        inputRefs.current[Math.min(Math.max(index, 0), length - 1)]?.focus();
    }

    function updateAt(index: number, input: string) {
        const digits = input.replace(/\D/g, "");

        if (!digits) {
            const next = Array.from({ length }, (_, charIndex) => chars[charIndex] ?? "");
            next[index] = "";
            onChange(next.join(""));
            return;
        }

        const next = Array.from({ length }, (_, charIndex) => chars[charIndex] ?? "");
        digits
            .slice(0, length - index)
            .split("")
            .forEach((digit, offset) => {
                next[index + offset] = digit;
            });

        onChange(next.join(""));
        focusInput(index + digits.length);
    }

    function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Backspace" && !chars[index] && index > 0) {
            focusInput(index - 1);
        }

        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();
            focusInput(index - 1);
        }

        if (event.key === "ArrowRight" && index < length - 1) {
            event.preventDefault();
            focusInput(index + 1);
        }
    }

    function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();
        updateAt(index, event.clipboardData.getData("text"));
    }

    return (
        <div className="grid grid-cols-6 gap-2 sm:gap-3" aria-label="Kode OTP">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(node) => {
                        inputRefs.current[index] = node;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    value={chars[index] ?? ""}
                    onChange={(event) => updateAt(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                    disabled={disabled}
                    maxLength={1}
                    className="h-12 min-w-0 rounded-xl border border-gray-300 text-center text-lg font-semibold text-[#19398A] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                />
            ))}
        </div>
    );
}
