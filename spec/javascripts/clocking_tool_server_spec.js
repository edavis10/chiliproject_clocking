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
    clockingTool.init();
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
      clockingTool.processProjectsFromServer(TestResponses.projects.success.responseText);

      expect(clockingTool.projects.length).toEqual(10);
      // TODO: refactor to matcher toContainEmptyProject ?
      expect(clockingTool.projects).toContain({id: 10, name: "Balanced 24/7 paradigm", loadedAt: "", activities: [], issues: []});
    });

  });

});
