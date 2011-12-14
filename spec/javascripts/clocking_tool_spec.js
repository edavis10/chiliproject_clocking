describe("ClockingTool", function() {
  var clockingTool;

  beforeEach(function() {
    clockingTool = new ClockingTool();
  });

  it("should have a var", function() {
    expect(clockingTool.test).toEqual(42);
  });
});
