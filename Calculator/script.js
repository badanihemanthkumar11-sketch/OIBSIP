const display = document.getElementById("display");
const buttons = document.getElementById("buttons");

let expression = "";
let justCalculated = false;
let errorState = false;

/*
 * Update the calculator display.
 */
function updateDisplay(value = expression) {
  display.textContent = value || "0";
}

/*
 * Check whether a character is an operator.
 */
function isOperator(char) {
  return ["+", "-", "*", "/"].includes(char);
}

/*
 * Get the last number from the current expression.
 */
function getCurrentNumber() {
  const match = expression.match(/(?:^|[+\-*/])(-?(?:\d+\.?\d*|\.\d+))$/);
  return match ? match[1] : "";
}

/*
 * Handle number buttons.
 */
function enterNumber(number) {
  if (errorState) {
    clearCalculator();
  }

  if (justCalculated) {
    expression = "";
    justCalculated = false;
  }

  expression += number;
  updateDisplay();
}

/*
 * Handle decimal point.
 */
function enterDecimal() {
  if (errorState) {
    clearCalculator();
  }

  if (justCalculated) {
    expression = "";
    justCalculated = false;
  }

  const currentNumber = getCurrentNumber();

  // Don't allow more than one decimal in a number.
  if (currentNumber.includes(".")) {
    return;
  }

  // Add 0 before a decimal if necessary.
  if (
    expression === "" ||
    isOperator(expression[expression.length - 1])
  ) {
    expression += "0";
  }

  expression += ".";
  updateDisplay();
}

/*
 * Handle operators.
 */
function enterOperator(operator) {
  if (errorState) {
    return;
  }

  // If the user presses an operator immediately after
  // getting a result, continue using the result.
  if (justCalculated) {
    justCalculated = false;
  }

  // Don't allow an operator at the beginning except minus.
  if (expression === "") {
    if (operator === "-") {
      expression = "-";
      updateDisplay();
    }
    return;
  }

  const lastChar = expression[expression.length - 1];

  // Replace the previous operator instead of adding another one.
  if (isOperator(lastChar)) {
    expression = expression.slice(0, -1) + operator;
  } else {
    expression += operator;
  }

  updateDisplay();
}

/*
 * Clear everything.
 */
function clearCalculator() {
  expression = "";
  justCalculated = false;
  errorState = false;
  updateDisplay();
}

/*
 * Remove the last entered character.
 */
function backspace() {
  if (errorState) {
    clearCalculator();
    return;
  }

  if (justCalculated) {
    clearCalculator();
    return;
  }

  expression = expression.slice(0, -1);
  updateDisplay();
}

/*
 * Tokenize the expression.
 *
 * Example:
 * "5+3*2"
 * becomes:
 * ["5", "+", "3", "*", "2"]
 */
function tokenize(input) {
  const tokens = [];
  let number = "";

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (
      /\d/.test(char) ||
      char === "."
    ) {
      number += char;
      continue;
    }

    if (isOperator(char)) {
      if (number !== "") {
        tokens.push(number);
        number = "";
      }

      /*
       * Handle a negative number at the beginning.
       * For example: -5+2
       */
      if (
        char === "-" &&
        tokens.length === 0 &&
        (i === 0 || isOperator(input[i - 1]))
      ) {
        number = "-";
      } else {
        tokens.push(char);
      }
    }
  }

  if (number !== "") {
    tokens.push(number);
  }

  return tokens;
}

/*
 * Convert infix operators to Reverse Polish Notation
 * using the Shunting Yard algorithm.
 *
 * This allows us to support normal mathematical precedence:
 *
 * 5 + 3 * 2
 *
 * becomes:
 *
 * 5 3 2 * +
 *
 * Result = 11
 */
function toPostfix(tokens) {
  const output = [];
  const operators = [];

  const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2
  };

  tokens.forEach(token => {
    if (!isOperator(token)) {
      output.push(token);
      return;
    }

    while (
      operators.length > 0 &&
      precedence[operators[operators.length - 1]] >= precedence[token]
    ) {
      output.push(operators.pop());
    }

    operators.push(token);
  });

  while (operators.length > 0) {
    output.push(operators.pop());
  }

  return output;
}

/*
 * Evaluate Reverse Polish Notation without eval().
 */
function evaluatePostfix(postfix) {
  const stack = [];

  for (const token of postfix) {
    if (!isOperator(token)) {
      stack.push(parseFloat(token));
      continue;
    }

    if (stack.length < 2) {
      throw new Error("Invalid expression");
    }

    const right = stack.pop();
    const left = stack.pop();

    let result;

    switch (token) {
      case "+":
        result = left + right;
        break;

      case "-":
        result = left - right;
        break;

      case "*":
        result = left * right;
        break;

      case "/":
        if (right === 0) {
          throw new Error("Cannot divide by zero");
        }

        result = left / right;
        break;

      default:
        throw new Error("Unknown operator");
    }

    stack.push(result);
  }

  if (stack.length !== 1 || Number.isNaN(stack[0])) {
    throw new Error("Invalid expression");
  }

  return stack[0];
}

/*
 * Format the result so long floating-point values
 * don't unnecessarily fill the display.
 */
function formatResult(result) {
  if (!Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  // Avoid values such as:
  // 0.30000000000000004
  const rounded = Number.parseFloat(result.toPrecision(12));

  return String(rounded);
}

/*
 * Evaluate the current expression.
 */
function calculate() {
  if (errorState || expression === "") {
    return;
  }

  // Don't calculate if the expression ends with an operator.
  if (isOperator(expression[expression.length - 1])) {
    return;
  }

  try {
    const tokens = tokenize(expression);

    if (tokens.length === 0) {
      return;
    }

    const postfix = toPostfix(tokens);
    const result = evaluatePostfix(postfix);
    const formattedResult = formatResult(result);

    expression = formattedResult;
    justCalculated = true;

    updateDisplay(formattedResult);
  } catch (error) {
    expression = "";
    errorState = true;
    justCalculated = false;

    display.textContent = error.message;
  }
}

/*
 * Event listener for all calculator buttons.
 *
 * There are no inline onclick attributes in HTML.
 */
buttons.addEventListener("click", event => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  // Number button
  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);
    return;
  }

  // Operator button
  if (button.dataset.operator) {
    enterOperator(button.dataset.operator);
    return;
  }

  // Other actions
  switch (button.dataset.action) {
    case "decimal":
      enterDecimal();
      break;

    case "clear":
      clearCalculator();
      break;

    case "backspace":
      backspace();
      break;

    case "equals":
      calculate();
      break;
  }
});

/*
 * Optional keyboard support.
 */
document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^\d$/.test(key)) {
    enterNumber(key);
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    enterOperator(key);
    return;
  }

  if (key === ".") {
    enterDecimal();
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace" || key === "Delete") {
    backspace();
    return;
  }

  if (key === "Escape" || key.toLowerCase() === "c") {
    clearCalculator();
  }
});

// Initial display.
updateDisplay();