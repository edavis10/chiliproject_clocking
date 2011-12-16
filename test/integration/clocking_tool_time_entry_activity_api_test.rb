require 'test_helper'

class ClockingToolTimeEntryApiTest < ActionController::IntegrationTest
  def setup
    Setting.rest_api_enabled = "1"
    assert Setting.rest_api_enabled?
    @user = User.generate!(:password => 'test', :password_confirmation => 'test').reload
    @project = Project.generate!.reload
    @activity1 = TimeEntryActivity.generate!(:name => 'One').reload
    @activity2 = TimeEntryActivity.generate!(:name => 'Two').reload
    @overridden_activity1 = TimeEntryActivity.generate!(:parent => @activity2, :project => @project, :name => 'Override').reload
  end

  context "with no project" do
    should "return a 404 status code" do
      get("/clocking_tool/activities.json?key=#{@user.api_key}")
      assert_equal 404, response.code.to_i
    end
  end

  context "for a project without permission to create time entries" do
    should "return a 403 status code" do
      get("/clocking_tool/activities.json?key=#{@user.api_key}&project_id=#{@project.id}")
      assert_equal 403, response.code.to_i
    end
  end

  context "for a project with permission to create time entries" do
    setup do
      @role = Role.generate!(:permissions => [:view_issues, :log_time])
      User.add_to_project(@user, @project, @role)
      get("/clocking_tool/activities.json?key=#{@user.api_key}&project_id=#{@project.id}")
    end
    
    should "be successful" do
      assert_equal 200, response.code.to_i
    end
    
    should_be_a_valid_json_string
    
    context "with the JSON string parsed" do
      setup do
        @json = parse_json(response)
      end
      
      should "be a list of activity hashes" do
        assert_equal 2, @json.length
        assert @json.first.is_a?(Hash), "Not an activity hash"
        assert @json.second.is_a?(Hash), "Not an activity hash"
      end

      should "use project overrides" do
        assert @json.any? {|activity| activity["name"] == "Override" }
        assert @json.none? {|activity| activity["name"] == "Two" }
      end
      
      should "have an id" do
        assert @json.all? {|activity| activity["id"].present? }, "Missing id field"
      end
      
      should "have a name" do
        assert @json.all? {|activity| activity["name"].present? }, "Missing name field"
      end
    end
  end

  def parse_json(response)
    ActiveSupport::JSON.decode(response.body)
  end
  
end
