export function setupCalculator(onDuressTrigger) {
  const display = document.getElementById("calcDisplay");
  const historyRail = document.getElementById("calcHistory");
  let currentFormula = "";

  document.querySelectorAll(".c-key[data-val]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-val");

      if (val === "+/-") {
        if (display.value.startsWith("-")) display.value = display.value.slice(1);
        else if (display.value) display.value = "-" + display.value;
        return;
      }

      if (val === "%") {
        display.value = String(parseFloat(display.value || 0) / 100);
        return;
      }

      currentFormula += val;
      display.value = currentFormula;

      if (currentFormula.includes("9999")) {
        console.warn("[COVERT TRIGGER] 9999 Duress PIN detected!");
        onDuressTrigger("COVERT_PIN_TRIGGER");
        currentFormula = "";
        display.value = "0";
        historyRail.innerText = "Error: 0x99";
      }
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    currentFormula = "";
    display.value = "";
    historyRail.innerText = "";
  });

  document.getElementById("evalBtn").addEventListener("click", () => {
    try {
      historyRail.innerText = currentFormula + " =";
      const evaluated = Function('"use strict";return (' + currentFormula + ")")();
      display.value = evaluated;
      currentFormula = String(evaluated);
    } catch {
      display.value = "Error";
      currentFormula = "";
    }
  });
}