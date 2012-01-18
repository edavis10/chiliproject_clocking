describe("ClockingTool server functions", function() {
  var clockingTool;
  var configuration = {
    rootUrl: "/",
    createUrl: "/time_entries.json",
    currentUserName: "demo user",
    apiKey: '0000000000'
  }

  var request;

  beforeEach(function() {
    localStorage.removeItem("caching");
    localStorage.removeItem("projects");

    clockingTool = new ClockingTool(configuration);
    loadFixtures('main.html');
    clockingTool.draw();

    jasmine.Ajax.useMock();

  });

  // NOTE: Ajax mocking
  describe("getProjects()", function() {
    it("should load projects from the server", function() {
      spyOn(clockingTool, 'processProjectsFromServer');

      clockingTool.getProjects();

      request = mostRecentAjaxRequest();
      request.response(TestResponses.projects.success);

      expect(clockingTool.processProjectsFromServer).toHaveBeenCalled();
    });

    it("should not connect to the server if the projects were cached within the past 24 hours", function() {
      // Fake out the first request
      clockingTool.processProjectsFromServer($.parseJSON(TestResponses.projects.success.responseText));

      // Now a request that hits the cache
      spyOn(clockingTool, 'serverGetProjects');
      clockingTool.getProjects();

      expect(clockingTool.serverGetProjects).not.toHaveBeenCalled();
    });

    it("should load projects from the local storage if present", function() {
      // Make sure the cache is used 
      clockingTool.caching.projects = (new Date).toString();

      var projectData = JSON.stringify($.parseJSON(TestResponses.projects.success.responseText).projects);
      localStorage.setItem("projects", projectData);

      // Mock the Ajax call in case it's fired
      spyOn(clockingTool, 'serverGetProjects');
      clockingTool.getProjects();

      expect(clockingTool.serverGetProjects).not.toHaveBeenCalled();
      expect(clockingTool.projects.length).toEqual(10);
    });

    it("should load the project data into the form", function() {
      clockingTool.processProjectsFromServer($.parseJSON(TestResponses.projects.success.responseText));

      clockingTool.getProjects();

      expect($('#project_id option').length).toEqual(11); // 10 + 1 "blank"
    });
  });

  describe("processProjectsFromServer()", function(){
    it("should store projects data locally in projects", function() {
      clockingTool.processProjectsFromServer($.parseJSON(TestResponses.projects.success.responseText));

      expect(clockingTool.projects.length).toEqual(10);
      // TODO: refactor to matcher toContainEmptyProject ?
      expect(clockingTool.projects).toContain({id: 10, name: "Balanced 24/7 paradigm", loadedAt: "", activities: [], issues: []});
    });

    it("should update the projectsLoadedAt property", function() {
      var year = (new Date).getFullYear();

      clockingTool.processProjectsFromServer($.parseJSON(TestResponses.projects.success.responseText));

      expect(clockingTool.caching.projects).toMatch(new RegExp(year.toString())); // Match at least the year
    });
  });

  // NOTE: Ajax mocking
  describe("getIssues()", function() {
    it("should load issues for the project from the server", function() {
      spyOn(clockingTool, 'processIssuesFromServer');

      clockingTool.getIssues(10);

      request = mostRecentAjaxRequest();
      request.response(TestResponses.issues.project10.success);

      expect(clockingTool.processIssuesFromServer).toHaveBeenCalled();
    });

    it("should not connect to the server if loadedAt is within the past 24 hours", function() {
      // Fake out the first request
      clockingTool.addProject(10, "Balanced 24/7 paradigm");
      clockingTool.updateProjectLoadedAt(10);

      // Now a request that hits the cache
      spyOn(clockingTool, 'serverGetIssues');
      clockingTool.getIssues(10);

      expect(clockingTool.serverGetIssues).not.toHaveBeenCalled();
    });

    it("should load issues from the local storage if present", function() {
      // Make sure the cache is used 
      clockingTool.addProject(10, "Balanced 24/7 paradigm");
      clockingTool.updateProjectLoadedAt(10);

      clockingTool.caching.projects = (new Date).toString();
      var issueData = JSON.parse(TestResponses.issues.project10.success.responseText);
      var projectData = {
        "id":10,
        "name": "Balanced 24/7 paradigm",
        "issues": issueData
      }

      localStorage.setItem("projects", JSON.stringify([projectData]));

      // Mock the Ajax call in case it's fired
      spyOn(clockingTool, 'serverGetIssues');
      clockingTool.getIssues(10);

      expect(clockingTool.serverGetIssues).not.toHaveBeenCalled();
      currentProject = clockingTool.findProject(10);
      expect(currentProject.issues.length).toEqual(106);
    });
  });

  describe("processIssuesFromServer()", function() {
    it("should store the issues locally inside of the project data", function() {
      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));

      currentProject = clockingTool.findProject(10);
      expect(currentProject.issues.length).toEqual(106); // 106 issues
    });

    it("should updated the loadedAt property on the project", function() {
      var year = (new Date).getFullYear();

      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));

      currentProject = clockingTool.findProject(10);
      expect(currentProject.loadedAt).toMatch(new RegExp(year.toString())); // Match at least the year
    });

    it("should enable the issue field on the form", function() {
      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      expect($('#issue_search')).toBeDisabled();
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));

      expect($('#issue_search')).not.toBeDisabled();
      
    });
  });

  // NOTE: Ajax mocking
  describe("getActivities()", function() {
    it("should load activities for the project from the server", function() {
      spyOn(clockingTool, 'processActivitiesFromServer');

      clockingTool.getActivities(10);

      request = mostRecentAjaxRequest();
      request.response(TestResponses.activities.project10.success);

      expect(clockingTool.processActivitiesFromServer).toHaveBeenCalled();
    });

    it("should not connect to the server if loadedAt is within the past 24 hours", function() {
      // Fake out the first request
      clockingTool.addProject(10, "Balanced 24/7 paradigm");
      clockingTool.updateProjectLoadedAt(10);

      // Now a request that hits the cache
      spyOn(clockingTool, 'serverGetActivities');
      clockingTool.getActivities(10);

      expect(clockingTool.serverGetActivities).not.toHaveBeenCalled();
    });

    it("should load activities from the local storage if present", function() {
      // Make sure the cache is used 
      clockingTool.addProject(10, "Balanced 24/7 paradigm");
      clockingTool.updateProjectLoadedAt(10);

      clockingTool.caching.projects = (new Date).toString();
      var activityData = JSON.parse(TestResponses.activities.project10.success.responseText);
      var projectData = {
        "id":10,
        "name": "Balanced 24/7 paradigm",
        "activities": activityData
      }

      localStorage.setItem("projects", JSON.stringify([projectData]));

      // Mock the Ajax call in case it's fired
      spyOn(clockingTool, 'serverGetActivities');
      clockingTool.getActivities(10);

      expect(clockingTool.serverGetActivities).not.toHaveBeenCalled();
      currentProject = clockingTool.findProject(10);
      expect(currentProject.activities.length).toEqual(3);
    });
  });

  describe("processActivitiesFromServer()", function() {
    beforeEach(function() {
      spyOn(clockingTool, 'loadActivitiesInForm');
    });

    it("should store the activities locally inside of the project data", function() {
      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      clockingTool.processActivitiesFromServer(10, $.parseJSON(TestResponses.activities.project10.success.responseText));

      currentProject = clockingTool.findProject(10);
      expect(currentProject.activities.length).toEqual(3);
    });

    it("should updated the loadedAt property on the project", function() {
      var year = (new Date).getFullYear();

      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      clockingTool.processActivitiesFromServer(10, $.parseJSON(TestResponses.activities.project10.success.responseText));

      currentProject = clockingTool.findProject(10);
      expect(currentProject.loadedAt).toMatch(new RegExp(year.toString())); // Match at least the year
    });

    it("should load the activities into the form", function() {
      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      clockingTool.processActivitiesFromServer(10, $.parseJSON(TestResponses.activities.project10.success.responseText));

      expect(clockingTool.loadActivitiesInForm).toHaveBeenCalled();
      
    });
  });

  // NOTE: Ajax mocking
  describe("saveTimeEntry()", function() {
    it("should submit the time entries to the server", function() {
      spyOn(clockingTool, 'processTimeEntrySaveResponse');
      var data = {
        "project_id": 10,
        "time_entry": {
          "hours": 1,
          "issue_id": 2,
          "activity_id": 3,
          "spent_on": "2010-01-01",
          "comments": "stuff"
        }}
      clockingTool.saveTimeEntry(data);

      request = mostRecentAjaxRequest();
      request.response(TestResponses.saveTimeEntry.project10.success);

      expect(clockingTool.processTimeEntrySaveResponse).toHaveBeenCalled();
    });

    it("should submit the time entries to the server and handle invalid data", function() {
      spyOn(clockingTool, 'processTimeEntrySaveResponse');
      // No hours
      var data = {
        "project_id": 10,
        "time_entry": {
          "issue_id": 2,
          "activity_id": 3,
          "spent_on": "2010-01-01",
          "comments": "stuff"
        }}
      clockingTool.saveTimeEntry(data);

      request = mostRecentAjaxRequest();
      request.response(TestResponses.saveTimeEntry.project10.invalid);

      expect(clockingTool.processTimeEntrySaveResponse).toHaveBeenCalled();
    });

    it("should submit the time entries to the server and handle unauthorized requests", function() {
      spyOn(clockingTool, 'processTimeEntrySaveResponse');
      var data = {
        "project_id": 10,
        "time_entry": {
          "hours": 1,
          "issue_id": 2,
          "activity_id": 3,
          "spent_on": "2010-01-01",
          "comments": "stuff"
        }}
      clockingTool.saveTimeEntry(data);

      request = mostRecentAjaxRequest();
      request.response(TestResponses.saveTimeEntry.project10.unauthorized);

      expect(clockingTool.processTimeEntrySaveResponse).toHaveBeenCalled();
    });


  });


  describe("processTimeEntrySaveResponse()", function() {
    beforeEach(function() {
//      spyOn(clockingTool, 'loadActivitiesInForm');
      clockingTool.addProject(10, "Balanced 24/7 paradigm");
      $('.form-container form input[type=submit]').attr("disabled", "disabled").val('Saving...'); // Submit button

    });

    describe("with successful save", function() {
      it("should clear the hours and comments", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.success);

        expect($('.form-container form input#time_entry_hours')).toHaveValue("");
        expect($('.form-container form input#time_entry_comments')).toHaveValue("");
        expect($('.form-container form input[type=submit]')).toHaveValue("Save");

      });

      it("should enable the form", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.success);

        expect($('.form-container form input[type=submit]')).not.toBeDisabled();
      });

      it("should update the message box", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.success);

        expect($('.message-box')).toHaveText('Time entry saved');
      });
    });

    describe("with an invalid save", function() {
      it("should enable the form", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.invalid);

        expect($('.form-container form input[type=submit]')).not.toBeDisabled();
      });
      
      it("should not clear the form", function() {
        $('#time_entry_comments').val('This is a comment');
        $('#time_entry_hours').val('10');

        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.invalid);

        expect($('.form-container form input#time_entry_hours')).toHaveValue("10");
        expect($('.form-container form input#time_entry_comments')).toHaveValue("This is a comment");

      });

      it("should update the message box with the errors", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.invalid);

        expect($('.message-box')).toHaveText("Error saving time: hours can't be blank");
        expect($('.message-box')).toHaveClass("error");
        expect($('.message-box')).toHaveClass("flash");
      });
    });

    describe("with an unauthorized save", function() {
      it("should enable the form", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.unauthorized);

        expect($('.form-container form input[type=submit]')).not.toBeDisabled();
      });

      it("should update the message box with the errors", function() {
        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.unauthorized);

        expect($('.message-box')).toHaveText("Error saving time: You are not authorized to access this page.");
        expect($('.message-box')).toHaveClass("error");
        expect($('.message-box')).toHaveClass("flash");
      });

      it("should not clear the form", function() {
        $('#time_entry_comments').val('This is a comment');
        $('#time_entry_hours').val('10');

        clockingTool.processTimeEntrySaveResponse(TestResponses.saveTimeEntry.project10.unauthorized);

        expect($('.form-container form input#time_entry_hours')).toHaveValue("10");
        expect($('.form-container form input#time_entry_comments')).toHaveValue("This is a comment");

      });
    });
  });

});
