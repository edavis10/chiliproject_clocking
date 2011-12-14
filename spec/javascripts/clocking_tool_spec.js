describe("ClockingTool", function() {
  var clockingTool;
  var configuration = {
    createUrl: "/time_entries.json",
    currentUserName: "demo user"
  }

  beforeEach(function() {
    clockingTool = new ClockingTool(configuration);
    loadFixtures('main.html');
    //    setFixtures(sandbox({id: "clocking-tool"}))
  });

  it("should have a var", function() {
    expect(clockingTool.test).toEqual(42);
  });

  describe("constructor", function() {
    xit("should allow setting options via a config object");
  });

  describe("init()", function() {
    it("should not raise an exception", function() {
      expect(function() {
        clockingTool.init();
      }).not.toThrow("anything");
    });

    xit("should configure the tool");
  });

  describe("draw()", function() {
    beforeEach(function() {
      clockingTool.init();
    });

    it("should create a div inside the container", function() {
      clockingTool.draw();

      expect($('#clocking-tool')).toContain('div.clocking-tool-inner');
    });

    it("should create the header elements", function() {
      clockingTool.draw();

      expect($('#clocking-tool')).toContain('.header .message-box');
      expect($('#clocking-tool')).toContain('.header .popout');
    });

    it("should create the form section elements", function() {
      clockingTool.draw();

      expect($('#clocking-tool')).toContain('.form-container');
    });

    it("should create the recent section elements", function() {
      clockingTool.draw();

      expect($('#clocking-tool')).toContain('.recent-container');
    });

    it("should populate the form action with the configured url", function() {
      clockingTool.draw();

      expect($('.form-container form')).toHaveAttr("action", "/time_entries.json");

    });

    it("should populate the field of spent on with today's date (YYYY-mm-dd format)", function() {
      today = new Date();
      clockingTool.draw();

      expect($('.form-container #time_entry_spent_on')).toHaveValue(formatDateToISO(today));

    });

    it("should add a blank option to the Activity field", function() {
      clockingTool.draw();

      expect($('.form-container #time_entry_activity_id option').length).toEqual(1);
      expect($('.form-container #time_entry_activity_id option:first')).toHaveValue('');
      expect($('.form-container #time_entry_activity_id option:first')).toHaveText('Activity');
    });

    it("should populate the message with a welcome message", function() {
      clockingTool.draw();

      expect($('.message-box')).toHaveText('Hi demo user, please clock your time below');
    });

    xit("should add event handling for the popup element");
    xit("should clear out the 'Go to issue' link");
    xit("should disable the fields");
    xit("should contact the server for the project data");
    xit("should populate the recent issues");
    xit("should draw pretty stuff");
  });
});
