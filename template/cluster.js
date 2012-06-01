var Cluster = require('cluster');

var num_cpus = require('os').cpus().length;

if (Cluster.isMaster) {
	for (var i=0; i<num_cpus; i++) {
		Cluster.fork();
	}
	
	Cluster.on('death', function(worker) {
		console.log('worker '+ worker.pid +' died');
		
		Cluster.fork();
	});
} else {
	var App = require('katana');
}