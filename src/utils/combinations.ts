export default function* combinations(arr, n) {
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

    const back = arr.pop();
    yield* combinations(arr, n)
    for (const comb of combinations(arr, n - 1)) {
        comb.push(back);
        yield comb;
    }
    arr.push(back);
}
