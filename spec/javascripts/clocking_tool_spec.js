describe("ClockingTool", function() {
  var clockingTool;
  var configuration = {
    createUrl: "/time_entries.json",
    currentUserName: "demo user"
  }

  beforeEach(function() {
    localStorage.removeItem("caching");
    localStorage.removeItem("projects");
    localStorage.removeItem("recentIssues");
    clockingTool = new ClockingTool(configuration);
    loadFixtures('main.html');
    //    setFixtures(sandbox({id: "clocking-tool"}))

    jasmine.Ajax.useMock();

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

    it("should link the popout element to the popup version", function() {
      expect($('#clocking-tool .popout')).toContain('a');
      expect($('#clocking-tool .popout a')).toHaveAttr('href', clockingTool.rootUrl + 'clocking_tool');
    });

    it("should create the form section elements", function() {
      expect($('#clocking-tool')).toContain('.form-container');
    });

    it("should create the issues section elements", function() {
      expect($('#clocking-tool')).toContain('.issues-container');
    });

    it("should populate the form action with the configured url", function() {
      expect($('.form-container form')).toHaveAttr("action", "/time_entries.json");
    });

    it("should populate the field of spent on with today's date (YYYY-mm-dd format)", function() {
      today = new Date();
      expect($('.form-container .time_entry_spent_on')).toHaveValue(formatDateToISO(today));
    });

    it("should populate the message with a welcome message", function() {
      expect($('.message-box')).toHaveText('Hi demo user, please clock your time below');
    });

    it("should disable the fields", function() {
      expect($('.project_id')).toBeDisabled();
      expect($('.issue_search')).toBeDisabled();
      expect($('.time_entry_activity_id')).toBeDisabled();
      expect($('.time_entry_hours')).toBeDisabled();
      expect($('.time_entry_spent_on')).toBeDisabled();
      expect($('.time_entry_comments')).toBeDisabled();
    });

    it("should hide the 'Go to issue' link", function() {
      expect($('.jump-to-issue')).toBeHidden();
    });

  });

  describe("loadProjectsInForm()", function() {
    beforeEach(function() {
      clockingTool.draw();
    });

    it("should add the default option", function() {
      clockingTool.loadProjectsInForm();

      expect($('.form-container .project_id option').length).toEqual(1);
      expect($('.form-container .project_id option:first')).toHaveValue('');
      expect($('.form-container .project_id option:first')).toHaveText('Project');

    });
    it("should add an option for each project", function() {
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");

      clockingTool.loadProjectsInForm();

      expect($('.form-container .project_id option').length).toEqual(3);
      expect($('.form-container .project_id option:nth(1)')).toHaveValue('1');
      expect($('.form-container .project_id option:nth(1)')).toHaveText('Project1');
      expect($('.form-container .project_id option:nth(2)')).toHaveValue('2');
      expect($('.form-container .project_id option:nth(2)')).toHaveText('Project2');

    });

    it("should clear and reset the field each time", function() {
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");

      clockingTool.loadProjectsInForm();
      expect($('.form-container .project_id option').length).toEqual(3);

      clockingTool.loadProjectsInForm();
      expect($('.form-container .project_id option').length).toEqual(3);
    });

    it("should enable the project field", function() {
      expect($('.project_id')).toBeDisabled();
      clockingTool.loadProjectsInForm();
      expect($('.project_id')).not.toBeDisabled();
    });
  });

  describe(".project_id.change() event", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
    });

    it("should trigger projectChange()", function() {
      spyOnEvent($('.project_id'), 'change');
      spyOn(clockingTool, 'projectChange');

      $('.project_id').val(1).change();

      expect('change').toHaveBeenTriggeredOn($('.project_id'));
      expect(clockingTool.projectChange).toHaveBeenCalled();
    });
  });

  describe("projectChange()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");
      clockingTool.loadProjectsInForm();
      $('.project_id').val(1);
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

      expect($('.issue_search')).not.toBeDisabled();
      expect($('.time_entry_activity_id')).not.toBeDisabled();
      expect($('.time_entry_hours')).not.toBeDisabled();
      expect($('.time_entry_spent_on')).not.toBeDisabled();
      expect($('.time_entry_comments')).not.toBeDisabled();
      
    });

    it("should clear the issue search field", function() {
      $('.issue_search').val("previous search");

      clockingTool.projectChange();
      
      expect($('.issue_search').val()).toEqual('');
    });

    it("should clear any search results", function() {
      $('.issue-results').append("<li>item</li>");

      clockingTool.projectChange();
      
      expect($('.issue-results')).toBeEmpty();
    });

    it("should clear the activity field", function() {
      $('.time_entry_activity_id').val("-1");

      clockingTool.projectChange();
      
      expect($('.time_entry_activity_id').val()).toEqual('');
    });

    describe("with the empty project selected", function() {
      beforeEach(function() {
        $('.project_id').val("");
      });
      
      it("should clear any search results", function() {
        $('.issue-results').append("<li>item</li>");

        clockingTool.projectChange();
      
        expect($('.issue-results')).toBeEmpty();
      });
      
      it("should not enable the fields", function() {
        clockingTool.projectChange();

        expect($('.issue_search')).toBeDisabled();
        expect($('.time_entry_activity_id')).toBeDisabled();
        expect($('.time_entry_hours')).toBeDisabled();
        expect($('.time_entry_spent_on')).toBeDisabled();
        expect($('.time_entry_comments')).toBeDisabled();

        expect($('.project_id')).not.toBeDisabled();

      });

      it("should not try to load the issues", function() {
        spyOn(clockingTool, 'getIssues');

        clockingTool.projectChange();

        expect(clockingTool.getIssues).not.toHaveBeenCalled();
      });

      it("should not try to load the activities", function() {
        spyOn(clockingTool, 'getActivities');

        clockingTool.projectChange();

        expect(clockingTool.getActivities).not.toHaveBeenCalled();
      });
      
    });
  });

  describe("loadIssuesInForm()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(2, "Project2");
      clockingTool.loadProjectsInForm();
      $('.project_id').val(1);
    });

    it("should run an empty search", function() {
      spyOn(clockingTool, 'issueChange');

      clockingTool.projectChange();

      expect(clockingTool.issueChange).toHaveBeenCalled();
    });
  });

  describe(".issue_search.keyup() event", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.loadProjectsInForm();
      $('.project_id').val(1);
    });

    it("should trigger issueChange()", function() {
      spyOnEvent($('.issue_search'), 'keyup');
      spyOn(clockingTool, 'issueChange');

      $('.issue_search').keyup();

      expect('keyup').toHaveBeenTriggeredOn($('.issue_search'));
      expect(clockingTool.issueChange).toHaveBeenCalled();
    });
  });

  describe("issueChange()", function() {
    beforeEach(function() {
      clockingTool.draw();
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(10, "Project10");
      clockingTool.loadProjectsInForm();
      $('.project_id').val(10);
      $('.issue_search').val('evil');
      // Adds issues from fixture
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));
    });

    it("should search the project's issue", function() {
      spyOn(clockingTool, 'searchIssues')
      $('.issue_search').val('search term');

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
      expect($('ul.search-results li').length).toEqual(59);
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
      $('.project_id').val(10);
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
      $('.project_id').val(10);
      $('.issue_search').val('evil');
      // Adds issues from fixture
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));
      clockingTool.issueChange(); // Trigger the search results

    });

    it("should clear the search results", function() {
      expect($('.search-results')).toBeVisible();
      clockingTool.selectIssue(983);
      expect($('.search-results')).not.toExist();
    });

    it("should fill in the issue search with the issue subject and id", function() {
      clockingTool.selectIssue(983);
      expect($('.issue_search')).toHaveValue("#983 Multi-channelled maximized instruction set");
    });

    it("should populate the form issue id", function() {
      clockingTool.selectIssue(983);
      expect($('.time_entry_issue_id')).toHaveValue('983');
    });

    it("should show the 'Go to issue' link", function() {
      expect($('.jump-to-issue')).toBeHidden();

      clockingTool.selectIssue(983);

      expect($('.jump-to-issue')).not.toBeHidden();
    });

    it("should set the link for the 'Go to issue' link", function() {
      clockingTool.selectIssue(983);

      expect($('.jump-to-issue')).toHaveAttr('href', '/issues/983');
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

  describe(".refesh-data.click() event", function() {
    beforeEach(function() {
      clockingTool.draw();
      localStorage.setItem("caching", JSON.stringify({"projects": "some string"}));
      localStorage.setItem("projects", JSON.stringify(["{'id': '1'}"]));
    });

    it("should trigger refreshData()", function() {
      spyOnEvent($('.refresh-data'), 'click');
      spyOn(clockingTool, 'refreshData');

      $('.refresh-data').click();

      expect('click').toHaveBeenTriggeredOn($('.refresh-data'));
      expect(clockingTool.refreshData).toHaveBeenCalled();
    });
  });

  describe("refreshData()", function() {
    beforeEach(function() {
      clockingTool.draw();
      localStorage.setItem("caching", JSON.stringify({"projects": "some string"}));
      localStorage.setItem("projects", JSON.stringify(["{'id': '1'}"]));
      spyOn(clockingTool, 'getProjects'); // Block "ajax" requests when reloading data
    });

    it("should clear the caching item in the storage", function() {
      clockingTool.refreshData();
      expect(localStorage.caching).toEqual(undefined);
    });

    it("should reset the projects item in the storage", function() {
      clockingTool.refreshData();
      expect(clockingTool.getProjects).toHaveBeenCalled();
    });

    it("should clear the projects out of the object cache", function() {
      clockingTool.addProject(1, "Project1");
      clockingTool.addProject(10, "Project10");

      clockingTool.refreshData();

      expect(clockingTool.projects).toEqual([]);
    });

    it("should clear the caching out of the object cache", function() {
      clockingTool.caching.projects = (new Date).toString();

      clockingTool.refreshData();

      expect(clockingTool.caching.projects).toEqual("");
    });
  });

  describe("showGoToIssue()", function() {
    beforeEach(function() {
      clockingTool.draw();
    });

    it("should set href to the issue", function() {
      clockingTool.showGoToIssue('983');
      expect($('.jump-to-issue')).toHaveAttr('href', '/issues/983');
    });

    describe("with an embedded form", function() {

      it("should open the current issue using the same window", function() {
        clockingTool.embedded = true;

        clockingTool.showGoToIssue('983');

        expect($('.jump-to-issue')).toHaveAttr('target', '');
      });
    });

    describe("with a popup form (non-embedded)", function() {
      it("should open the current issue in a new window", function() {
        clockingTool.embedded = false;

        clockingTool.showGoToIssue('983');

        expect($('.jump-to-issue')).toHaveAttr('target', '_blank');
      });

    });
  });

  describe("addRecentIssue()", function() {
    beforeEach(function() {
      clockingTool.draw();
    });

    it("should add a recent issue to recentIssues", function() {
      expect(clockingTool.recentIssues.length).toEqual(0);

      clockingTool.addRecentIssue(10, 983);

      expect(clockingTool.recentIssues.length).toEqual(1);
      expect(clockingTool.recentIssues[0].project_id).toEqual(10);
      expect(clockingTool.recentIssues[0].issue_id).toEqual(983);
    });

    it("should remove the oldest entry when there are more than 20 issues (FIFO array)", function() {
      clockingTool.addRecentIssue(10, 1);
      clockingTool.addRecentIssue(10, 2);
      clockingTool.addRecentIssue(10, 3);
      clockingTool.addRecentIssue(10, 4);
      clockingTool.addRecentIssue(10, 5);
      clockingTool.addRecentIssue(10, 6);
      clockingTool.addRecentIssue(10, 7);
      clockingTool.addRecentIssue(10, 8);
      clockingTool.addRecentIssue(10, 9);
      clockingTool.addRecentIssue(10, 10);

      clockingTool.addRecentIssue(10, 11);
      clockingTool.addRecentIssue(10, 12);
      clockingTool.addRecentIssue(10, 13);
      clockingTool.addRecentIssue(10, 14);
      clockingTool.addRecentIssue(10, 15);
      clockingTool.addRecentIssue(10, 16);
      clockingTool.addRecentIssue(10, 17);
      clockingTool.addRecentIssue(10, 18);
      clockingTool.addRecentIssue(10, 19);
      clockingTool.addRecentIssue(10, 20);

      clockingTool.addRecentIssue(10, 21); // Should push out first item

      // [21, 20, 19...2]
      expect(clockingTool.recentIssues.length).toEqual(20);
      expect(clockingTool.recentIssues[0].issue_id).toEqual(21);
      expect(clockingTool.recentIssues[19].issue_id).toEqual(2);

    });

    it("should save the recent issue list into local storage", function() {
      clockingTool.addRecentIssue(10, 1);

      var recentFromStorage = JSON.parse(localStorage.getItem("recentIssues"));
      expect(recentFromStorage.length).toEqual(1);
      expect(recentFromStorage[0].issue_id).toEqual(1);
      expect(recentFromStorage[0].project_id).toEqual(10);
    });
  });

  describe("showRecentIssues()", function() {
    beforeEach(function() {
      clockingTool.addRecentIssue(10, 983);
      clockingTool.addProject(10, "Project10");
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));

      clockingTool.draw();
    });

    it("should show the recent issues", function() {
      expect($('.issue-results li').length).toBeLessThan(20);
      expect($('.issue-results')).toContain('.recent-issue');
      expect($('.issue-results .recent-issue')).
        toHaveText("#983 > Project10 > Multi-channelled maximized instruction set");
    });

    it("should bind a click event to each recent issue to prepopulate the form", function() {
      spyOn(clockingTool, 'fillFormFromRecentIssue');

      $('.issue-results a.recent-issue:first').click();

      expect(clockingTool.fillFormFromRecentIssue).toHaveBeenCalledWith(10, 983);
    });
  });

  describe("fillFormFromRecentIssue()", function() {
    beforeEach(function() {
      clockingTool.addRecentIssue(10, 983);
      clockingTool.draw();
      clockingTool.addProject(10, "Project10");
      clockingTool.loadProjectsInForm();
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));
      clockingTool.processActivitiesFromServer(10, $.parseJSON(TestResponses.activities.project10.success.responseText));

    });

    it("should populate the project field", function() {
      clockingTool.fillFormFromRecentIssue(10, 983);

      expect($('select.project_id')).toHaveValue('10');
    });

    it("should populate the issue id", function() {
      clockingTool.fillFormFromRecentIssue(10, 983);

      expect($('.time_entry_issue_id')).toHaveValue('983');
    });
    
    it("should populate the search field", function() {
      clockingTool.fillFormFromRecentIssue(10, 983);

      expect($('.issue_search')).
        toHaveValue('#983 Multi-channelled maximized instruction set');
    });

    it("should populate the activity field", function() {
      clockingTool.fillFormFromRecentIssue(10, 983);

      expect($('.time_entry_activity_id option').length).toEqual(4);
    });

    it("should enable the form", function() {
      clockingTool.fillFormFromRecentIssue(10, 983);

      expect($('.project_id')).not.toBeDisabled();
      expect($('.issue_search')).not.toBeDisabled();
      expect($('.time_entry_activity_id')).not.toBeDisabled();
      expect($('.time_entry_hours')).not.toBeDisabled();
      expect($('.time_entry_spent_on')).not.toBeDisabled();
      expect($('.time_entry_comments')).not.toBeDisabled();

    });
    
    it("should not run the search results", function() {
      clockingTool.fillFormFromRecentIssue(10, 983);

      expect($('.issue-results')).not.toHaveClass("search-results");
    });
  });
});
