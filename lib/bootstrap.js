// Rename it to something else? but what? ...

/*
 # Listen uncaughtException
*/
/*process.on('uncaughtException', function(error) {
	console.log('uncaughtException ['+ process.pid +']: \n' + error);
});*/


/*
 # Extend EventEmitter, add series and parallel emit methods with done handler
*/
var EventEmitter = require('events').EventEmitter;
var Async        = require('async');

// Call all EventListener's in parallel and callback on all done
EventEmitter.prototype.parallel = function(event, callback) {
	emit.call(this, event, callback, Array.prototype.slice.call(arguments, 2), 'parallel');
}

// Call all EventListener's in order they are added and callback on last done
EventEmitter.prototype.series = function(event, callback) {
	emit.call(this, event, callback, Array.prototype.slice.call(arguments, 2), 'series');
}

// Listener wrapper
var fn = function(listener, args) {	
	return function(callback) {
		args = args.concat(callback);
		
		listener.apply(listener, args);
	}
}

// Custom Event emit which allow to run event listeners in parallel or series
// also we could listen all event listeners complete with callback
function emit(event, callback, args, type) {
	// Get all listeners for this event added with standart addListener or on methods
	var listeners = this.listeners(event);
	
	// Prepared list of listeners
	var list = [];
	
	if (args.length) {
		var n = listeners.length;
		
		for (var i=0; i<n; i++) {
			// Wrap listener
			var f = fn(listeners[i], args);
			
			list.push(f);
		}
	} else {
		list = listeners;
	}
	
	// Parallel or Series
	var method = type === 'parallel' ? Async.parallel : Async.series;
	
	method(list, callback || function(error, results) {
		if (error) { throw error; }
	});
}





















