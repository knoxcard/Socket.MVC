Socket.MVC
==========

Socket.MVC extends the usability of Socket.io in an MVC environment.  The current version of Socket.MVC has only been tested in an application using Express.  Future releases will be tested using the different frameworks that Socket.io supports.  Socket.MVC is designed for versions 0.9x, but in future releases versions 1.0 will be supported.  The only thing Socket.MVC wants to do is give you the freedom to emit from any file in your application at any time.

## Install

First you will need a version of Socket.io.  The fastest way to accomplish this is using NPM.

    npm install socket.io

Next use NPM to install Socket.MVC

	npm install socket.mvc

## How to use

app.js
```js
var express = require('express');
var routes = require('./routes');
var app = module.exports = express.createServer('127.0.0.1');
var io = require('socket.io').listen(server);
var socketMVC = require('socket.mvc');

//Set socket.io configuration here

io.sockets.on('connection', function (socket) {
	socketMVC.init(io, socket, {
		debug: true,
		filePath: ['./routes/socket.js']
	});
});
```

routes/socket.js
```js
module.exports = function (socket) {
	//You can declare all of your socket listeners in this file, but it's not required

	socket.on('login', function() {
		console.log('logged in')
	});
};
```

controllers/index.js
```js
var socketMVC = require('socket.mvc');

/*Login logic*/
socketMVC.emit('logged in');
```

### How to get the most out of Socket.MVC

In the example above you see 3 arguments being passed into the init function.  The first is Socket.io, is the socket returned from the Socket.io connection, and the third is the options object for Socket.MVC. You do not have to place all of your socket listeners in a separate JS file, but it will make your life easier.  The best feature of Socket.MVC is that you can simply require the module, and then just send an emit, or a broadcast or any other information through the websocket inside any function in any file of the application.

## API

### Init

Init takes 3 different arguments.

`socketMVC.init('socket.io', 'socket', 'config')`
  - `Socket.io` This is simply a `var` that is equal to `require('socket.io')`
  - `Socket` This is the socket that is returned from Socket.io after a connection is made
  - `Config` This is an obj that you can pass to configure your Socket.MVC experience

The `Config` object is structured as the following:
```js
{
	debug: boolean, //Default to true, but in production make sure you change it to false
	filePath:  string or array //This can be an array of file paths, or a single file path to register Socket.io listeners
}
```

### Emit
Emit is the bread and butter of Socket.MVC, because you can now send data via Websockets from any file in your application.  Socket.MVC will queue events that have taken place prior to a websocket connection, meaning, if you start up your application and no one has connected to it (for the first time only), but events are running `SocketMVC.emit`, the events will be thrown into a queue, and once a connection is made the queued events will be sent to appropriate connections.
```js
socketMVC.emit('sendToSomeone', 'Sending this to the socket that triggered the event');
```

### Broadcast
Broadcast will send data to every connection except the connection that triggered the event.  This will also take advantage of the event queuing system, and will broadcast once a connection is made.
```js
socketMVC.broadcast('sendToMostlyEveryone', 'Sending this to everyone but the socket who triggered the event');
```

### Everyone
Everyone is an API that allows you to broadcast an event to every socket (including the socket that triggered the event).  This API also takes advantage of the event queuing system.
```js
socketMVC.everyone('sendToEveryone!', 'Sending this to everyone connected!!');
```

### On
The on event registers a listener for Socket.io, but it is preferred that you use this method inside a socket listener file.  If you choose to use the API it will still work, but what takes place is that Socket.MVC will store your `on` events in a queue, and when a client connects to Socket.io the listeners will then be registered asynchronously.

### Socket.io API's
Since Socket.MVC is just a wrapping mechanism for Socket.io, all of the same API's can be used using the Socket.MVC module.  Please see a list of all of the API's available by visiting the Socket.io Github page, or http://socket.io (depending on your version)
