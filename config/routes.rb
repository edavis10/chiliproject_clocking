ActionController::Routing::Routes.draw do |map|
  map.connect 'clocking_tool', :controller => 'clocking_tool', :action => 'index'
  map.connect 'clocking_tool/:action.:format', :controller => 'clocking_tool'
end

