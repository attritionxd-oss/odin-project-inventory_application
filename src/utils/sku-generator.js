// sku gen
describe("isolated test", () => {
  it("should result in a random value", () => {
    const array = new Uint32Array(10);
    const randVal = crypto.getRandomValues(array);

    expect(randVal).toBe(1);
    // [3979312248, 24287291, 2520837283, 3159908216, 2540468556, 4179254934, 849377436, 3646632826, 1586996304, 946091781]
  });
});
