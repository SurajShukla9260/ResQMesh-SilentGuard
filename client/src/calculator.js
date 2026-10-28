export function setupCalculator(onDuressTrigger) {
  const display = document.getElementById("calcDisplay");
  const historyRail = document.getElementById("calcHistory");
  let currentFormula = "";

  // 1. Handle all numeric and operator buttons (using data-value)
  document.querySelectorAll(".c-key[data-value]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-value");

      if (val === "%") {
        try {
          const evaluated = Function('"use strict";return (' + (currentFormula || "0") + ")")();
          display.value = String(evaluated / 100);
          currentFormula = display.value;
        } catch {
          display.value = "0";
          currentFormula = "";
        }
        return;
      }

      currentFormula += val;
      display.value = currentFormula;

      // Covert Duress Trigger PIN check
      if (currentFormula.includes("9999")) {
        console.warn("[COVERT TRIGGER] 9999 Duress PIN detected!");
        onDuressTrigger("COVERT_PIN_TRIGGER");
        currentFormula = "";
        display.value = "0";
        if (historyRail) historyRail.innerText = "Error: 0x99";
      }
    });
  });

  // 2. Handle Action buttons (AC, DEL, =)
  document.querySelectorAll(".c-key[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");

      if (action === "clear") {
        currentFormula = "";
        display.value = "0";
        if (historyRail) historyRail.innerText = "";
      } else if (action === "delete") {
        currentFormula = currentFormula.slice(0, -1);
        display.value = currentFormula || "0";
      } else if (action === "calculate") {
        if (!currentFormula) return;
        try {
          if (historyRail) historyRail.innerText = currentFormula + " =";
          const evaluated = Function('"use strict";return (' + currentFormula + ")")();
          display.value = String(evaluated);
          currentFormula = String(evaluated);
        } catch {
          display.value = "Error";
          currentFormula = "";
        }
      }
    });
  });
}