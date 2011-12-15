require 'test_helper'

class ClockingToolIssuesApiTest < ActionController::IntegrationTest
  def setup
    Setting.rest_api_enabled = "1"
    assert Setting.rest_api_enabled?
    @user = User.generate!(:password => 'test', :password_confirmation => 'test').reload
    @project = Project.generate!.reload
    @issue1 = Issue.generate_for_project!(@project, :subject => 'first')
    @issue2 = Issue.generate_for_project!(@project, :subject => 'second')
    @issue3 = Issue.generate_for_project!(@project, :subject => 'third')
    
  end

  context "with no project" do
    should "return a 404 status code" do
      get("/clocking_tool/issues.json?key=#{@user.api_key}")
      assert_equal 404, response.code.to_i
    end
  end

  context "for a project without permission to create time entries" do
    should "return a 403 status code" do
      get("/clocking_tool/issues.json?key=#{@user.api_key}&project_id=#{@project.id}")
      assert_equal 403, response.code.to_i
    end
  end

  context "for a project with permission to create time entries" do
    setup do
      @role = Role.generate!(:permissions => [:view_issues, :log_time])
      User.add_to_project(@user, @project, @role)
      get("/clocking_tool/issues.json?key=#{@user.api_key}&project_id=#{@project.id}")
    end
    
    should "be successful" do
      assert_equal 200, response.code.to_i
    end
    
    should_be_a_valid_json_string
    
    context "with the JSON string parsed" do
      setup do
        @json = parse_json(response)
      end
      
      should "be a list of issue hashes" do
        assert_equal 3, @json.length
        assert @json.first.is_a?(Hash), "Not an issue hash"
        assert @json.second.is_a?(Hash), "Not an issue hash"
        assert @json.third.is_a?(Hash), "Not an issue hash"
      end
      
      should "have an id" do
        assert @json.all? {|issue| issue["id"].present? }, "Missing id field"
      end
      
      should "have a subject" do
        assert @json.all? {|issue| issue["subject"].present? }, "Missing subject field"
      end

      should "have searchData" do
        assert @json.all? {|issue| issue["searchData"].present? }, "Missing searchData field"
      end

      should "have searchData be pipe (|) separated" do
        assert @json.all? {|issue| issue["searchData"].include?("|") }, "searchData format is invalid"
      end
      
    end
  end

  def parse_json(response)
    ActiveSupport::JSON.decode(response.body)
  end
  
end
