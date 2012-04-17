module.exports = {
	// Default routing
	route: {
    directory: '',
    controller: 'home',
    action: 'index',
    arguments: []
  },

  // RegExp routes
	routes: [
    // Add your routes here
  ],

  // 404 requests will be redirected to this controller and action if they exists
  controller_404: 'home',
  action_404: '_404',
  
  // Allowed characters in uri
  // If uri not match them then default routing is used
  allowed_characters: '-_:~%.\/a-zа-я0-9'
}
