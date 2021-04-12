export function linspace(a: number, b: number, n: number) {
  const incr = (b - a) / (n - 1)
  return Array.from({ length: n }, (_, i) => a + i * incr)
}
