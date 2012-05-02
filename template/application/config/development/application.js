module.exports = {
	domain: 'http://katana:8000',
	host: '127.0.0.1',
	port: 8000,
	
	ssl: {
		enabled: false,
		
		key: 'ssl/key.pem',
		cert: 'ssl/cert.pem'
	},
	
	view: {
		engine: 'ejs',
		ext: '.html',
	  o_tag: '<?',
	  c_tag: '?>'
	},
	
	cookie: {
		enabled: true,
		
		path: '/',
		domain: null,
		lifetime: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true
	},
	
	session: {
		enabled: true,
		
		key_name: 'session_id',
		key_length: 32,
		lifetime: 1000 * 60 * 60 * 24 * 7,
		store: 'redis',
		
		defaults: {
			logget_in: false,
			user_id: 0
		}
	},
	
	multipart: {
		uploadDir: global.root + 'temp/files',
		keepExtensions: true,
		encoding: 'utf-8'
		
		//maxFieldsSize: 1024 * 1024 * 5
	},
	
	static: {
		enabled: true,
		
		path: 'public/',
		
		max_age: 0,
		hiddens: false,
		get_only: true
	}
}
































