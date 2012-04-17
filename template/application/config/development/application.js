module.exports = {
	host: 'katana',
	port: 8000,
	
	view: {
		engine: 'ejs',
		ext: '.html',
	  o_tag: '<?',
	  c_tag: '?>'
	},
	
	cookie: {
		path: '/',
		domain: null,
		lifetime: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true
	},
	
	session: {
		key_name: 'session_id',
		key_length: 32,
		lifetime: 1000 * 60 * 60 * 24 * 7,
		store: 'redis',
		
		defaults: {
			logget_in: false,
			user_id: 0,
			last_action: 0
		}
	}
}
































