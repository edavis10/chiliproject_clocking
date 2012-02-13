module ChiliprojectClocking
  module Hooks
    class ViewLayoutsBaseBodyBottomHook < Redmine::Hook::ViewListener
      render_on :view_layouts_base_body_bottom, :partial => 'clocking_tool/embed', :locals => {:embedded => true}
    end
  end
end
