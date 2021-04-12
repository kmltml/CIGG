export function linspace(a, b, n) {
    const incr = (b - a) / (n - 1);
    return Array.from({ length: n }, (_, i) => a + i * incr);
}
