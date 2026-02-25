// Простые математические примеры: ответ 10–99, числа в примерах 0–100, только + и −

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const RESULT_MIN = 10;
const RESULT_MAX = 99;
const NUM_MAX = 100;

/** Один пример: { a, b, result, op } — op: '+', '-' */
function generateOneTask() {
  const op = ['+', '-'][randInt(0, 1)];
  if (op === '+') {
    const sum = randInt(RESULT_MIN, RESULT_MAX);
    const a = randInt(0, sum);
    const b = sum - a;
    return { a, b, result: sum, op };
  }
  const result = randInt(RESULT_MIN, RESULT_MAX);
  const b = randInt(0, NUM_MAX - result);
  const a = b + result;
  return { a, b, result, op };
}

/** Массив из count примеров (по умолчанию 5). */
export function generateMathTasks(count = 5) {
  return Array.from({ length: count }, generateOneTask);
}

/** Символ операции для отображения */
export function opSymbol(op) {
  switch (op) {
    case '+': return '+';
    case '-': return '−';
    default: return op;
  }
}
