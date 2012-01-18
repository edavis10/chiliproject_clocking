module ChiliprojectClocking
  module Hooks
    class ViewLayoutsBaseHtmlHeadHook < Redmine::Hook::ViewListener
      def view_layouts_base_html_head(context={})
        return javascript_include_tag('underscore-min.js', :plugin => 'chiliproject_clocking') +
          javascript_include_tag('jquery.js', :plugin => 'chiliproject_clocking') +
          javascript_include_tag('jquery.tmpl.min.js', :plugin => 'chiliproject_clocking') +
          javascript_include_tag('helpers.js', :plugin => 'chiliproject_clocking') +
          javascript_tag('jQuery.noConflict();') +
          javascript_include_tag('clocking_tool.js', :plugin => 'chiliproject_clocking') +
          stylesheet_link_tag('clocking_tool', :plugin => 'chiliproject_clocking')

      end
    end
  end
end
