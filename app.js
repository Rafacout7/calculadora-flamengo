const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll("button");

let a = null;          // primeiro número
let op = null;         // operador
let waitingB = false;  // esperando o segundo número (ainda não começou a digitar)
let current = "0";     // número atual digitado

function updateDisplay() {
  if (a !== null && op !== null) {
    const bText = waitingB ? "" : current; // mostra b quando está digitando
    expressionEl.textContent = `${format(a)} ${op} ${bText}`.trim();
  } else {
    expressionEl.textContent = "";
  }
  resultEl.textContent = current;
}

function format(n) {
  const rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function toNumber(str) {
  return Number(str);
}

function clearAll() {
  a = null;
  op = null;
  waitingB = false;
  current = "0";
  updateDisplay();
}

function backspace() {
  if (current === "Erro") {
    current = "0";
    updateDisplay();
    return;
  }

  if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}

function toggleSign() {
  if (current === "Erro") return;
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

function appendDigit(d) {
  if (current === "Erro") return;

  if (waitingB) {
    current = d;
    waitingB = false;
  } else {
    current = (current === "0") ? d : current + d;
  }
  updateDisplay();
}

function appendDot() {
  if (current === "Erro") return;

  if (waitingB) {
    current = "0.";
    waitingB = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
}

// Regra % estilo calculadora de celular:
// - se houver "a op b", ao apertar %, transforma b em percentual conforme op:
//   + ou − : b = a * (b/100)
//   × ou ÷ : b = b/100
// - se não houver operador, transforma current em current/100
function percent() {
  if (current === "Erro") return;

  const bRaw = toNumber(current);
  let bAdj = bRaw;

  if (a !== null && op !== null) {
    if (op === "+" || op === "−") {
      bAdj = a * (bRaw / 100);
    } else if (op === "×" || op === "÷") {
      bAdj = bRaw / 100;
    } else {
      bAdj = bRaw / 100;
    }

    current = format(bAdj);
    waitingB = false; // já existe b
  } else {
    current = format(bRaw / 100);
  }

  updateDisplay();
}

function setOperator(nextOp) {
  if (current === "Erro") return;

  const curNum = toNumber(current);

  if (a === null) {
    a = curNum;
    op = nextOp;
    waitingB = true;
    current = "0";
    updateDisplay();
    return;
  }

  // Se já tinha operador e o usuário digitou b (waitingB=false), calcula antes
  if (op !== null && !waitingB) {
    const result = calculate(a, op, curNum);
    if (result === null) {
      showError();
      return;
    }
    a = result;
    current = format(result);
  }

  op = nextOp;
  waitingB = true;
  current = "0";
  updateDisplay();
}

function calculate(x, operator, y) {
  switch (operator) {
    case "+": return x + y;
    case "−": return x - y;
    case "×": return x * y;
    case "÷": return y === 0 ? null : x / y;
    default: return null;
  }
}

function equals() {
  if (current === "Erro") return;
  if (a === null || op === null) return;

  const b = toNumber(current);
  const result = calculate(a, op, b);
  if (result === null) {
    showError();
    return;
  }

  current = format(result);
  a = null;
  op = null;
  waitingB = false;
  expressionEl.textContent = "";
  resultEl.textContent = current;
}

function showError() {
  a = null;
  op = null;
  waitingB = false;
  current = "Erro";
  expressionEl.textContent = "";
  resultEl.textContent = current;
}

buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const t = btn.textContent.trim();

    if (t >= "0" && t <= "9") return appendDigit(t);
    if (t === ".") return appendDot();
    if (t === "CE") return clearAll();
    if (t === "←") return backspace();
    if (t === "±") return toggleSign();
    if (t === "=") return equals();

    // % agora é função (não operador)
    if (t === "%") return percent();

    // operadores: +, −, ×, ÷
    if (["+", "−", "×", "÷"].includes(t)) return setOperator(t);
  });
});

updateDisplay();
