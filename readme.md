# [Katana](https://github.com/Shogun147/Katana) 

Easy to use, hmvc scalable web framework for any Node.js samurai, focuses on simplicity, maintainability and performance.

## Features

* Powerful, flexible classical router
* Scalable through HMVC architecture 
* Environment based configuration
* Application quick generators
* Cookies and Session support
* Templating, partials support
* Fully non-blocking
* …

## Installation

Fastest way to get Katana is to install it with NPM:

    $ npm install -g katana

## Quick start

The quickest way to start is to utilize the Katana executable to generate an application:

    $ katana create app
    $ cd app
    $ npm install

The app path is optional and is relative to current path.

Then you are ready to start the server:

    $ node app

### Basic application layout after creation will look like this:
    .
    ├── app.js
    ├── application
    │   ├── config
    │   │   ├── development
    │   │   │   ├── application.js
    │   │   │   ├── routing.js
    │   │   │   └── stores.js
    │   │   └── production
    │   ├── controllers
    │   │   └── home.js
    │   ├── models
    │   └── views
    │       └── index.html
    ├── modules
    ├── public
    │   ├── images
    │   ├── scripts
    │   └── styles
    └── temp

## Routing

Classical routing is one the most powerful futures of Katana framework. It uses uri segments to determine the controller and action for a requested URI.<br>
So unlike in other Node.js framework you may just add controllers and actions without the need to create routing rules, but also let you write your own rules which may change the path.<br>
Without any rules, uri path will be treated as: http://katana:8000/`controller`/`action`/`arg1`/../`argN`

So if uri path is: `http://katana:8000/account/login`<br>
Then `controller=account` and `action=login`.

If there no uri segments then default path will be used, `home` as controller and `index` as action.

You can also rewrite this path by set the routing rule, for example:

    routes: [
      ['account/(.*)', 'auth/$1']
    ]

This will set `controller=auth` and `action=login`.

Or you may pass this request to mvc module:

    routes: [
      ['account/(.*)', '#auth/actions/$1']
    ]

The `#` symbol meen that this request will pass to `auth` module, `controller=actions` and `action=login`.

`!important:` mvc modules may have their own routing rules.

## Modules

In Katana modules can be used as mvc part or your application or as middleware.

For mvc modules you can use routing the same way as for main mvc.<br>
Also you can run them as widgets by calling run method: 

    Module('auth').run('users/list');

This will run `list` action of `users` controller from `auth` module.

Middleware modules can listen specific application events and interact as they need.

For example auth module can look like this:

    var App = require('katana'); // or global.App
    var User = App.Model('auth:user'); // get user model of auth module

    // listen new request event
    App.on('request', function(Request, Response, callback) {
      Request.user = new User(Request.session);

      callback(); // callback when we're done here, required for application to continue
    });

and then in our controller we can access user object as `Request.user`.

## Controllers

Controllers are almost most important part of any application, they handle incoming requests and send responses.

A simple controller looks like this:

    var App = require('katana');
    
    require('joose'); // load Joose, great class system

    // define our controller Class
    Class('Home_Controller', {
      isa: App.Controller, // extend Katana Core Controller

      methods: {
        index: function(Response, Request) {
          Response.send('Hello World!');
        }
      }
    });

    module.exports = new Home_Controller;

And now we can access this `index` action by opening http://katana:8000/, without any uri path this will use default controller and action from config which are `home` and `index`. Also we can access them directly by opening http://katana:8000/`home`/ with `index` as default action or http://katana:8000/`home`/`index`.

## Models

Katana did not limit the developer to define a model in some way or to use a specific module. It just autoload all from the models directory of application or a module and store them in a local registry.

You can access them like this:<br>

    var App = require('katana'); // or global.App
    var News = App.Model('news'); // get model object

To get a model from module you need to separate module name and model path with colon `:`, for example to get `user` model of `auth` module call: `App.Model('auth:user')`.

Model file can look like this:

    var App = require('katana');
    var Mongoose = App.Store('mongoose'); // get mongoose connection, look at stores config file
    var Schema = require('mongoose').Schema;

    var User = new Schema({
      username: String,
      password: String,
      email: String,
      signed_at: Date,
      roles: ['user', 'moderator', 'administrator']
    });

    module.exports = Mongoose.model('User', User);

## Views

To render a view you can use a few methods:

    var App = require('katana');
    var View = App.View;

    require('joose');

    Class('Home_Controller', {
      isa: App.Controller,

      methods: {
        index: function(Response, Request) {
          // directly render and send a view content
          Response.render('index', { title: 'Hello World' }); // this will render index.html file from views

          // get rendered content
          var content = View.render('index', { title: 'Hello World' });
          // and latter send response
          Response.send(content);

          // render a view from module
          Users.find({}, function(error, users) {
            if (error) { return Response.send('Error! Blablabla'); }

            // again module name separated by colon, and then path to the view
            var list = View.render('auth:list', users);

            Response.render('index', { users: list });
          });
        }
      }
    });

Controllers can also have their global data, which will be passed for the this.render calls:

    var App = require('katana');
  
    require('joose');
  
    Class('Home_Controller', {
      isa: App.Controller,
    
      have: {
        // set global controller data
        data: {
          title: 'This is title for all pages for this controller',
          total_requests: 0
        }
      },
    
      methods: {
        index: function(Response) {
          // you can also set global controller data from actions
          this.set('copyright', 'blablabla');
          // or
          this.data.total_requests++;
        
          // by render the view with this.render method, the controller data will pass to this view
          var content = this.render('index'); // <?-title?>, <?-total_requests?>
        
          // we may also rewrite globals by set them on render
          var content = this.render('index', { title: 'This is rewritted title', foo: 'bar' });
        
          Response.send(content);
        }
      }
    });

## Events

Katana application emit specific events for different steps.
Few of them are available for middlewares, the others are for bootstrap control flow.

For example, `auth` module can listen `request` event to assign a user model for request (see Modules).

Or a `chat` module which need application server to create a socket.io server.

    var App = require('katana');

    var socket_io = require('socket.io');
    var io;

    // ready event is emitted when Http.Server start listening
    App.on('ready', function(callback) {
	  io = socket_io.listen(App.server);
	
	  io.sockets.on('connection', function (socket) {
	    // …
	  });
	
	  callback();
    });

## Contributing
Anyone interested or who like the framework idea can contribute by sending new ideas, issues or pull requests. Any help would be appreciated.

## License
The MIT License

Copyright © 2012 D.G. Shogun <Shogun147@gmail.com>