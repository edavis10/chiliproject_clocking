require 'test_helper'

class ClockingToolEmbedTest < ActionController::IntegrationTest
  def setup
    Setting.rest_api_enabled = "1"
    assert Setting.rest_api_enabled?
    @user = User.generate!(:password => 'test', :password_confirmation => 'test').reload
    @project = Project.generate!.reload
    @role = Role.generate!(:permissions => [:view_issues, :log_time])
    User.add_to_project(@user, @project, @role)

    login_as(@user.login, 'test')
  end

  context "standalone page" do
    setup do
      visit("/clocking_tool")
    end
    
    should "be successful" do
      assert_response :success
    end
    
    should "include the clocking tool javascript" do
      # contains substring match
      assert has_css?('script[src*=underscore-min]')
      assert has_css?('script[src*=jquery]')
      assert has_css?('script[src*=tmpl]') # jquery.tmpl.min
      assert has_css?('script[src*=helpers]')
      assert has_css?('script[src*=clocking_tool]')
    end
    
    should "draw the clocking tool" do
      assert has_css?('script', :text => /draw/)
    end
    
    should "include the base layout's header section to reuse CSS and JavaScript" do
      assert has_css?('link[href*=application]') # contains substring match
      assert has_css?('script[src*=application]') # contains substring match
    end

  end
end
