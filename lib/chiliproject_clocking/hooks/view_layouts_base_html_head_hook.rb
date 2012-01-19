module ChiliprojectClocking
  module Hooks
    class ViewLayoutsBaseHtmlHeadHook < Redmine::Hook::ViewListener
      def view_layouts_base_html_head(context={})
        js_libs = [javascript_include_tag('underscore-min.js', :plugin => 'chiliproject_clocking')]

        jquery_included = begin
                            ChiliProject::Compatibility && ChiliProject::Compatibility.using_jquery?
                          rescue NameError
                            # No compatibilty test
                            false
                          end
        unless jquery_included
          js_libs << javascript_include_tag('jquery.js', :plugin => 'chiliproject_clocking')
          js_libs << javascript_tag('jQuery.noConflict();')
        end

        js_libs << javascript_include_tag('jquery.tmpl.min.js', :plugin => 'chiliproject_clocking')
        js_libs << javascript_include_tag('helpers.js', :plugin => 'chiliproject_clocking')
        js_libs << javascript_include_tag('clocking_tool.js', :plugin => 'chiliproject_clocking')

        js_libs << stylesheet_link_tag('clocking_tool', :plugin => 'chiliproject_clocking')

        return js_libs.join(' ')

      end
    end
  end
end
