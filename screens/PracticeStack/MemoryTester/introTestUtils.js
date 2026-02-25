// Генерация 20 двузначных чисел без повторов (строки "00"-"99")
export function generateIntroSequence() {
  const arr = [];
  while (arr.length < 20) {
    const n = Math.floor(Math.random() * 100);
    const s = n < 10 ? '0' + n : String(n);
    if (!arr.includes(s)) arr.push(s);
  }
  return arr;
}
