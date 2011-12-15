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

    jasmine.Ajax.useMock();
  });

  describe("constructor", function() {
    xit("should allow setting options via a config object");
  });

  describe("draw()", function() {
    beforeEach(function() {
      clockingTool.draw();
    });

    it("should create a div inside the container", function() {
      expect($('#clocking-tool')).toContain('div.clocking-tool-inner');
    });

    it("should create the header elements", function() {
      expect($('#clocking-tool')).toContain('.header .message-box');
      expect($('#clocking-tool')).toContain('.header .popout');
    });

    it("should create the form section elements", function() {
      expect($('#clocking-tool')).toContain('.form-container');
    });

    it("should create the recent section elements", function() {
      expect($('#clocking-tool')).toContain('.recent-container');
    });

    it("should populate the form action with the configured url", function() {
      expect($('.form-container form')).toHaveAttr("action", "/time_entries.json");
    });

    it("should populate the field of spent on with today's date (YYYY-mm-dd format)", function() {
      today = new Date();
      expect($('.form-container #time_entry_spent_on')).toHaveValue(formatDateToISO(today));
    });

    it("should add a blank option to the Activity field", function() {
      expect($('.form-container #time_entry_activity_id option').length).toEqual(1);
      expect($('.form-container #time_entry_activity_id option:first')).toHaveValue('');
      expect($('.form-container #time_entry_activity_id option:first')).toHaveText('Activity');
    });

    it("should populate the message with a welcome message", function() {
      expect($('.message-box')).toHaveText('Hi demo user, please clock your time below');
    });

    it("should disable the fields", function() {
      expect($('#project_id')).toBeDisabled();
      expect($('#issue_search')).toBeDisabled();
      expect($('#time_entry_activity_id')).toBeDisabled();
      expect($('#time_entry_hours')).toBeDisabled();
      expect($('#time_entry_spent_on')).toBeDisabled();
      expect($('#time_entry_comments')).toBeDisabled();
    });


    xit("should add event handling for the popup element");
    xit("should clear out the 'Go to issue' link");
    xit("should contact the server for the project data");
    xit("should populate the recent issues");
    xit("should draw pretty stuff");
  });

  describe("loadProjectsInForm()", function() {
    beforeEach(function() {
      clockingTool.draw();
    });

    it("should add the default option", function() {
      clockingTool.loadProjectsInForm();

      expect($('.form-container #project_id option').length).toEqual(1);
      expect($('.form-container #project_id option:first')).toHaveValue('');
      expect($('.form-container #project_id option:first')).toHaveText('Project');

    });
    it("should add an option for each project", function() {
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");

      clockingTool.loadProjectsInForm();

      expect($('.form-container #project_id option').length).toEqual(3);
      expect($('.form-container #project_id option:nth(1)')).toHaveValue('1');
      expect($('.form-container #project_id option:nth(1)')).toHaveText('Project1');
      expect($('.form-container #project_id option:nth(2)')).toHaveValue('2');
      expect($('.form-container #project_id option:nth(2)')).toHaveText('Project2');

    });

    it("should clear and reset the field each time", function() {
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");

      clockingTool.loadProjectsInForm();
      expect($('.form-container #project_id option').length).toEqual(3);

      clockingTool.loadProjectsInForm();
      expect($('.form-container #project_id option').length).toEqual(3);
    });

    it("should enable the project field", function() {
      expect($('#project_id')).toBeDisabled();
      clockingTool.loadProjectsInForm();
      expect($('#project_id')).not.toBeDisabled();
    });
  });

  describe("#project_id.change() event", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
    });

    it("should trigger projectChange()", function() {
      spyOnEvent($('#project_id'), 'change');

      $('#project_id').val(1).change();

      expect('change').toHaveBeenTriggeredOn($('#project_id'));
    });
  });

  describe("projectChange()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");
      clockingTool.loadProjectsInForm();
      $('#project_id').val(1);
    });

    it("should load issues", function() {
      spyOn(clockingTool, 'getIssues');

      clockingTool.projectChange();

      expect(clockingTool.getIssues).toHaveBeenCalledWith('1');
    });
  });
});
