// NOTE: This file exists to support older imports, but must remain valid JavaScript.
// The typed implementation lives in generatePairs.ts.
function generatePairs(count = 5) {
  const pairs = [];
  const used = new Set();
  while (pairs.length < count) {
    const a = Math.floor(Math.random() * 15) + 1;
    const b = Math.floor(Math.random() * 15) + 1;
    const left = `${a} + ${b}`;
    const right = String(a + b);
    const sig = `${a},${b}`;
    if (used.has(sig)) continue;
    used.add(sig);
    pairs.push({ left, right });
  }
  return pairs;
}

export { generatePairs }
export default generatePairs
