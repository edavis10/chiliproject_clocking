describe("ClockingTool", function() {
  var clockingTool;
  var configuration = {
    createUrl: "/time_entries.json",
    currentUserName: "demo user"
  }

  beforeEach(function() {
    localStorage.removeItem("caching");
    localStorage.removeItem("projects");
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

    // NOTE: Ajax mocking
    it("should load the projects", function() {
      clockingTool.draw();

      request = mostRecentAjaxRequest();
      request.response(TestResponses.projects.success);

      expect(clockingTool.projects.length).toEqual(10);
    });

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
      spyOn(clockingTool, 'projectChange');

      $('#project_id').val(1).change();

      expect('change').toHaveBeenTriggeredOn($('#project_id'));
      expect(clockingTool.projectChange).toHaveBeenCalled();
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

    it("should load activities", function() {
      spyOn(clockingTool, 'getActivities');

      clockingTool.projectChange();

      expect(clockingTool.getActivities).toHaveBeenCalledWith('1');
    });

    it("should enable the form fields", function() {
      clockingTool.projectChange();

      expect($('#issue_search')).not.toBeDisabled();
      expect($('#time_entry_activity_id')).not.toBeDisabled();
      expect($('#time_entry_hours')).not.toBeDisabled();
      expect($('#time_entry_spent_on')).not.toBeDisabled();
      expect($('#time_entry_comments')).not.toBeDisabled();
      
    });
  });

  describe("#issue_search.keyup() event", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.loadProjectsInForm();
      $('#project_id').val(1);
    });

    it("should trigger issueChange()", function() {
      spyOnEvent($('#issue_search'), 'keyup');
      spyOn(clockingTool, 'issueChange');

      $('#issue_search').keyup();

      expect('keyup').toHaveBeenTriggeredOn($('#issue_search'));
      expect(clockingTool.issueChange).toHaveBeenCalled();
    });
  });

  describe("issueChange()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(10, "Project10");
      clockingTool.loadProjectsInForm();
      $('#project_id').val(10);
      $('#issue_search').val('evil');
      // Adds issues from fixture
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));
    });

    it("should search the project's issue", function() {
      spyOn(clockingTool, 'searchIssues')
      $('#issue_search').val('search term');

      clockingTool.issueChange();

      expect(clockingTool.searchIssues).toHaveBeenCalledWith('search term');
    });

    it("should display a search results box", function() {
      clockingTool.issueChange();

      expect($('#clocking-tool')).toContain('.search-results');
      expect($('.search-results')).toBeVisible();
    });

    it("should populate the search results with the issues", function() {
      clockingTool.issueChange();
      expect($('.search-results')).toContain("ul");
      expect($('.search-results ul li').length).toEqual(59);
    });

    it("should bind to the search results's click to select an issue", function() {
      clockingTool.issueChange();
      spyOn(clockingTool, 'selectIssue');

      $('.search-results li a:first').click();

      expect(clockingTool.selectIssue).toHaveBeenCalledWith(983);
    });
  });

  describe("searchIssues()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(10, "Project10");
      clockingTool.loadProjectsInForm();
      $('#project_id').val(10);
      // Adds issues from fixture
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));
    });

    it("should look for issues with a matching search term", function() {
      expect(clockingTool.findProject(10).issues.length).toEqual(106); // 106 issues
      
      var results = clockingTool.searchIssues("evil");

      expect(results.length).toEqual(59);
    });

    it("should only search the specific project", function() {
      var results = clockingTool.searchIssues("evil");
      var project10 = clockingTool.findProject(10);

      _.each(results, function(issue) {
        expect(_.indexOf(project10.issues, issue) >= 0)
      });

    });
  });

  describe("selectIssue()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(10, "Project10");
      clockingTool.loadProjectsInForm();
      $('#project_id').val(10);
      $('#issue_search').val('evil');
      // Adds issues from fixture
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));
      $('.search-results').show();

    });

    it("should close the search results", function() {
      expect($('.search-results')).toBeVisible();
      clockingTool.selectIssue(983);
      expect($('.search-results')).toBeHidden();
    });

    it("should fill in the issue search with the issue subject", function() {
      clockingTool.selectIssue(983);
      expect($('#issue_search')).toHaveValue("Multi-channelled maximized instruction set");
    });

    it("should populate the form issue id", function() {
      clockingTool.selectIssue(983);
      expect($('#time_entry_issue_id')).toHaveValue('983');
    });
  });

  describe("form submission", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(10, "Project10");
      clockingTool.loadProjectsInForm();
    });

    it("should disable the form", function() {
      $('.form-container form').submit();

      expect($('.form-container form input[type=submit]')).toBeDisabled();
    });

    it("should change the submit button value to 'Saving...'", function() {
      $('.form-container form').submit();

      expect($('.form-container form input[type=submit]')).toHaveValue("Saving...");
    });

    xit("should connect to the server via ajax");
  });

  describe("getCachingFromStorage()", function() {
    describe("with nothing stored", function() {
      it("should do nothing to the caching object", function() {
        clockingTool.getCachingFromStorage();
        expect(clockingTool.caching).toEqual({"projects": ""});
      });
    });

    describe("with something stored", function() {
      it("should load the stored object into the instance", function() {
        localStorage.setItem("caching", JSON.stringify({"projects": "some string"}));

        clockingTool.getCachingFromStorage();

        expect(clockingTool.caching).toEqual({"projects": "some string"});
      });
    });
  });
});
