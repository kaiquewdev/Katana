module.exports = {
	redis: {
		type: 'redis',
		
		host: 'localhost',
		port: 6379,
		socket: null,
		password: null,
		database: null,
		
		options: {
			no_ready_check: false
		}
	},
	
	mongoose: {
		type: 'mongoose',
		
		uri: null, // mongodb://localhost:27017/katana
		
		host: 'localhost',
		port: 27017,
		database: 'katana',
		
		options: {}
	},
	
	mysql: {
		type: 'mysql',
		
		host: 'localhost',
		port: 3306,
		user: 'root',
		password: '',
		database: 'katana',
		
		debug: false
	}
}






















