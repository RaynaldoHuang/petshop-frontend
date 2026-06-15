"use client";

import { useEffect } from "react";

const BLOCKED_KEYS = new Set(["-", "+", "e", "E"]);

export default function NonNegativeNumberInputs() {
  useEffect(() => {
    function getNumberInput(target: EventTarget | null) {
      return target instanceof HTMLInputElement && target.type === "number"
        ? target
        : null;
    }

    function handleFocus(event: FocusEvent) {
      const input = getNumberInput(event.target);
      if (input && !input.hasAttribute("min")) input.min = "0";
    }

    function handleKeyDown(event: KeyboardEvent) {
      const input = getNumberInput(event.target);
      if (input && BLOCKED_KEYS.has(event.key)) event.preventDefault();
    }

    function handleBeforeInput(event: InputEvent) {
      const input = getNumberInput(event.target);
      if (input && event.data && /[-+eE]/.test(event.data)) {
        event.preventDefault();
      }
    }

    function handleInput(event: Event) {
      const input = getNumberInput(event.target);
      if (input && input.value !== "" && Number(input.value) < 0) {
        input.value = "0";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("beforeinput", handleBeforeInput);
    document.addEventListener("input", handleInput);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("beforeinput", handleBeforeInput);
      document.removeEventListener("input", handleInput);
    };
  }, []);

  return null;
}
