export default function generatePairs(count: number = 5): { left: string; right: string }[] {
  const pairs: { left: string; right: string }[] = [];
  const used = new Set<string>();
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