const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll("button");

let a = null;          // primeiro número
let op = null;         // operador
let waitingB = false;  // esperando o segundo número
let current = "0";     // número atual digitado

function updateDisplay() {
  if (a !== null && op !== null) {
    // mostra "a op b" enquanto digita b
    const bText = waitingB ? current : "";
    expressionEl.textContent = `${format(a)} ${op} ${bText}`.trim();
  } else {
    expressionEl.textContent = "";
  }
  resultEl.textContent = current;
}

function format(n) {
  // evita mostrar 8.0000000002
  const rounded = Math.round((n + Number.EPSILON) * 1e10) / 1e10;
  // mostra inteiro sem .0
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
  if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}

function toggleSign() {
  if (current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

function appendDigit(d) {
  if (waitingB) {
    // começando o segundo número
    current = d;
    waitingB = false;
  } else {
    current = (current === "0") ? d : current + d;
  }
  updateDisplay();
}

function appendDot() {
  if (waitingB) {
    current = "0.";
    waitingB = false;
  } else if (!current.includes(".")) {
    current += ".";
  }
  updateDisplay();
}

function setOperator(nextOp) {
  const curNum = toNumber(current);

  if (a === null) {
    a = curNum;
    op = nextOp;
    waitingB = true;
    current = "0";
    updateDisplay();
    return;
  }

  // se já tinha operador e já digitou b, calcula antes de trocar operador
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
    case "%": return x % y;
    default: return null;
  }
}

function equals() {
  if (a === null || op === null) return;

  const b = toNumber(current);
  const result = calculate(a, op, b);
  if (result === null) {
    showError();
    return;
  }

  // no "=" mostrar só o resultado, e limpar expressão
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

    // operadores: +, −, ×, ÷, %
    if (["+", "−", "×", "÷", "%"].includes(t)) return setOperator(t);
  });
});

updateDisplay();
