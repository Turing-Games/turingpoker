import combinations from "@party/src/utils/combinations";

test("Combinations of [1, 2, 3, 4, 5] with n = 3", () => {
    const arr = [1, 2, 3, 4, 5];
    const n = 3;
    const result = [...combinations(arr, n)];
    console.log(result);
    const expected = [
        [1, 2, 3],
        [1, 2, 4],
        [1, 3, 4],
        [2, 3, 4],
        [1, 2, 5],
        [1, 3, 5],
        [2, 3, 5],
        [1, 4, 5],
        [2, 4, 5],
        [3, 4, 5]
    ];
    expect(result).toEqual(expected);
});