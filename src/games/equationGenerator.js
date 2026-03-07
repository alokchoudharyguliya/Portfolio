function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addSub(min, max) {
  const a = rand(min, max);
  const b = rand(min, max);
  if (Math.random() < 0.5) {
    return { display: `${a} + ${b}`, answer: a + b };
  }
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return { display: `${big} - ${small}`, answer: big - small };
}

function multiply(min, max) {
  const a = rand(min, max);
  const b = rand(min, max);
  return { display: `${a} × ${b}`, answer: a * b };
}

function divide(divisorMin, divisorMax, answerMin, answerMax) {
  const divisor = rand(divisorMin, divisorMax);
  const answer = rand(answerMin, answerMax);
  return { display: `${divisor * answer} ÷ ${divisor}`, answer };
}

/**
 * @param {number} round - current round number (1-based)
 * @returns {{ display: string, answer: number }}
 */
export function generateEquation(round) {
  if (round <= 3)  return addSub(1, 10);
  if (round <= 6)  return addSub(2, 20);
  if (round <= 10) return Math.random() < 0.5 ? addSub(5, 25) : multiply(2, 9);
  const r = Math.random();
  if (r < 0.33) return addSub(5, 30);
  if (r < 0.66) return multiply(2, 12);
  return divide(2, 9, 2, 10);
}
