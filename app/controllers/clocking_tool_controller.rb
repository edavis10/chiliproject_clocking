class ClockingToolController < ApplicationController
  unloadable
  before_filter :find_project_by_project_id
  before_filter :authorize
  accept_key_auth :issues
  
  def issues
    respond_to do |format|
      format.json { render :json => {} }
    end
  end

  private

  def authorize
    if User.current.allowed_to?(:log_time, @project)
      
    else
      render_403
    end
  end
end
