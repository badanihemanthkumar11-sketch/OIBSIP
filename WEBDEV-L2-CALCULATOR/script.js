const display = document.getElementById("display");

const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");
const clearButton = document.getElementById("clear");
const backspaceButton = document.getElementById("backspace");
const equalsButton = document.getElementById("equals");

let expression = "";
let justCalculated = false;


// -----------------------------
// Number Buttons
// -----------------------------
numberButtons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.number;

        if (justCalculated) {
            expression = "";
            justCalculated = false;
        }

        // Prevent multiple decimal points in the same number
        if (value === ".") {

            const parts = expression.split(/[+\-*/]/);
            const currentNumber = parts[parts.length - 1];

            if (currentNumber.includes(".")) {
                return;
            }

            if (currentNumber === "") {
                expression += "0.";
            } else {
                expression += ".";
            }

        } else {
            expression += value;
        }

        updateDisplay();
    });

});


// -----------------------------
// Operator Buttons
// -----------------------------
operatorButtons.forEach(button => {

    button.addEventListener("click", () => {

        const operator = button.dataset.operator;

        // Backspace does not have a data-operator
        if (!operator) {
            return;
        }

        if (expression === "") {
            return;
        }

        justCalculated = false;

        const lastCharacter = expression[expression.length - 1];

        // Prevent two operators next to each other
        if ("+-*/".includes(lastCharacter)) {
            expression = expression.slice(0, -1);
        }

        expression += operator;

        updateDisplay();
    });

});


// -----------------------------
// Clear Button
// -----------------------------
clearButton.addEventListener("click", () => {

    expression = "";
    justCalculated = false;

    display.value = "0";

});


// -----------------------------
// Backspace Button
// -----------------------------
backspaceButton.addEventListener("click", () => {

    if (justCalculated) {
        expression = "";
        justCalculated = false;
        display.value = "0";
        return;
    }

    expression = expression.slice(0, -1);

    updateDisplay();

});


// -----------------------------
// Equals Button
// -----------------------------
equalsButton.addEventListener("click", () => {

    if (expression === "") {
        return;
    }

    const lastCharacter = expression[expression.length - 1];

    // Don't calculate if expression ends with an operator
    if ("+-*/".includes(lastCharacter)) {
        return;
    }

    try {

        const result = calculateExpression(expression);

        expression = result.toString();
        display.value = expression;

        justCalculated = true;

    } catch (error) {

        display.value = error.message;
        expression = "";
        justCalculated = true;

    }

});


// -----------------------------
// Update Display
// -----------------------------
function updateDisplay() {

    if (expression === "") {
        display.value = "0";
        return;
    }

    display.value = expression
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−");

}


// -----------------------------
// Calculate Expression
// -----------------------------
function calculateExpression(input) {

    const numbers = [];
    const operators = [];

    let currentNumber = "";

    // Convert the expression into numbers and operators
    for (let i = 0; i < input.length; i++) {

        const character = input[i];

        if (
            (character >= "0" && character <= "9") ||
            character === "."
        ) {

            currentNumber += character;

        } else if ("+-*/".includes(character)) {

            if (currentNumber === "") {
                throw new Error("Invalid Expression");
            }

            numbers.push(parseFloat(currentNumber));
            operators.push(character);

            currentNumber = "";
        }
    }

    if (currentNumber === "") {
        throw new Error("Invalid Expression");
    }

    numbers.push(parseFloat(currentNumber));


    // Check division by zero
    for (let i = 0; i < operators.length; i++) {

        if (operators[i] === "/" && numbers[i + 1] === 0) {
            throw new Error("Cannot divide by zero");
        }
    }


    // First perform multiplication and division
    for (let i = 0; i < operators.length; i++) {

        if (operators[i] === "*" || operators[i] === "/") {

            let result;

            if (operators[i] === "*") {
                result = numbers[i] * numbers[i + 1];
            } else {
                result = numbers[i] / numbers[i + 1];
            }

            numbers.splice(i, 2, result);
            operators.splice(i, 1);

            i--;
        }
    }


    // Then perform addition and subtraction
    let result = numbers[0];

    for (let i = 0; i < operators.length; i++) {

        if (operators[i] === "+") {
            result += numbers[i + 1];
        }

        if (operators[i] === "-") {
            result -= numbers[i + 1];
        }
    }


    // Remove unnecessary decimal digits
    return Number(result.toFixed(10));
}


// -----------------------------
// Keyboard Support
// -----------------------------
document.addEventListener("keydown", (event) => {

    const key = event.key;

    // Numbers
    if (key >= "0" && key <= "9") {

        const button = document.querySelector(
            `[data-number="${key}"]`
        );

        if (button) {
            button.click();
        }
    }

    // Decimal
    else if (key === ".") {

        const button = document.querySelector(
            `[data-number="."]`
        );

        button.click();
    }

    // Operators
    else if (key === "+" || key === "-" || key === "*" || key === "/") {

        const button = document.querySelector(
            `[data-operator="${key}"]`
        );

        if (button) {
            button.click();
        }
    }

    // Enter = calculate
    else if (key === "Enter" || key === "=") {
        equalsButton.click();
    }

    // Backspace
    else if (key === "Backspace") {
        backspaceButton.click();
    }

    // Escape = clear
    else if (key === "Escape") {
        clearButton.click();
    }

});