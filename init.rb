require 'redmine'

Redmine::Plugin.register :chiliproject_clocking do
  name 'Chiliproject Clocking plugin'
  author 'Author name'
  description 'This is a plugin for ChiliProject'
  version '0.0.1'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'
end
require 'chiliproject_clocking/hooks/view_layouts_base_html_head_hook'
require 'chiliproject_clocking/hooks/view_layouts_base_body_bottom_hook'
