export default function* combinations<T>(arr: T[], n: number): Generator<T[]> {
    if (n == 0) {
        yield [];
        return;
    }
    if (n > arr.length) {
        return;
    }
    if (n == arr.length) {
        yield [...arr];
        return;
    }

    // n > 0, so this exists
    const back = arr.pop() as T;
    yield* combinations(arr, n)
    for (const comb of combinations(arr, n - 1)) {
        comb.push(back);
        yield comb;
    }
    arr.push(back);
}
