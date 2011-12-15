ActionController::Routing::Routes.draw do |map|
  map.connect 'clocking_tool/:action.:format', :controller => 'clocking_tool'
end

