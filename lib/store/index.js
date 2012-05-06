var App = require('katana');
var Log = App.Log;

var Stores = {};

App.on('boot.stores', function(callback) {
	var pending = Object.keys(App.Config('stores')).length;
	
  for (store in App.Config('stores')) {
	  var config = App.Config('stores')[store];
	
	  require('./' + config.type)(store, config, function(name, connection) {
		  Stores[name] = connection;
		
		  if (!--pending) {
			  callback();
		  }
	  });
  }
});

module.exports = function(store) {
	if (store) {
		return Stores[store];
	}
	
	return Stores;
};
