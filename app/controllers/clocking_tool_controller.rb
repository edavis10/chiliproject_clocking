class ClockingToolController < ApplicationController
  unloadable
  before_filter :find_project_by_project_id, :except => :index
  before_filter :authorize, :except => :index
  accept_key_auth :issues, :activities

  def index
    render :action => 'index', :layout => false
  end
  
  def issues
    @issues = @project.issues.visible

    respond_to do |format|
      format.json { render :json => issues_to_clocking_tool_format(@issues) }
    end
  end

  def activities
    @activities = @project.activities

    respond_to do |format|
      format.json { render :json => activities_to_clocking_tool_format(@activities) }
    end
  end

  private

  def authorize
    if User.current.allowed_to?(:log_time, @project)
      
    else
      render_403
    end
  end

  def issues_to_clocking_tool_format(issues)
    issues.inject([]) do |acc, issue|
      optional_deliverable = if issue.respond_to?(:deliverable)
                               issue.deliverable.try(:title)
                             else
                               ""
                             end
      
      search_string = "#{issue.id}|#{issue.subject}|#{issue.category.try(:name)}|#{optional_deliverable}|#{issue.assigned_to.try(:name)}|#{issue.description}"
      acc << {
        "id" => issue.id,
        "subject" => issue.subject,
        "searchData" => search_string
      }
    end
  end

  def activities_to_clocking_tool_format(activities)
    activities.inject([]) do |acc, activity|
      acc << {"id" => activity.id, "name" => activity.name}
    end
  end
  
end
