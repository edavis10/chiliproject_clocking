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
  });

  describe("processProjectsFromServer()", function(){
    it("should store projects data locally in projects", function() {
      clockingTool.processProjectsFromServer($.parseJSON(TestResponses.projects.success.responseText));

      expect(clockingTool.projects.length).toEqual(10);
      // TODO: refactor to matcher toContainEmptyProject ?
      expect(clockingTool.projects).toContain({id: 10, name: "Balanced 24/7 paradigm", loadedAt: "", activities: [], issues: []});
    });

    it("should load the project data into the form", function() {
      clockingTool.processProjectsFromServer($.parseJSON(TestResponses.projects.success.responseText));

      expect($('#project_id option').length).toEqual(11); // 10 + 1 "blank"
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
  });

  describe("processIssuesFromServer()", function() {
    it("should store the issues locally inside of the project data", function() {
      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));

      currentProject = clockingTool.findProject(10);
      expect(currentProject.issues.length).toEqual(106); // 106 issues
    });

    it("should enable the issue field on the form", function() {
      clockingTool.addProject(10, "Balanced 24/7 paradigm");

      expect($('#issue_search')).toBeDisabled();
      clockingTool.processIssuesFromServer(10, $.parseJSON(TestResponses.issues.project10.success.responseText));

      expect($('#issue_search')).not.toBeDisabled();
      
    });
  });
});
