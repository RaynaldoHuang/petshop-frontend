"use client";

import { useEffect, useState } from "react";

type OtpResendButtonProps = {
    loading?: boolean;
    onResend: () => void;
    className?: string;
};

const COOLDOWN_SECONDS = 60;

export default function OtpResendButton({
    loading = false,
    onResend,
    className = "mt-4 h-11 w-full rounded-xl border border-gray-200 text-sm font-semibold text-[#19398A] transition hover:border-orange-300 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-70",
}: OtpResendButtonProps) {
    const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setSecondsLeft((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const canResend = secondsLeft === 0;

    return (
        <button
            type="button"
            onClick={onResend}
            disabled={loading || !canResend}
            className={className}
        >
            {loading
                ? "Mengirim..."
                : canResend
                    ? "Kirim ulang OTP"
                    : `Kirim ulang OTP (${formatTime(secondsLeft)})`}
        </button>
    );
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}
