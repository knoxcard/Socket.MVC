var _ = require('underscore'),
	async = require('async'),
	colors = require('colors'),
	path = require('path');

colors.setTheme({
	info: 'green'
});

(function(SocketMVC) {

	var _setSocket = function(io, socket) {
		SocketMVC.io = io;
		_debug('SocketMVC io set', 'info');
		SocketMVC.socket = socket;
		_debug('SocketMVC socket set', 'info');
		_setMVCMethods();
	};

	var _setMVCMethods = function() {
		var counter = 1;
		_debug('Setting SocketMVC methods', 'info');
		for (var name in SocketMVC.socket) {
			if (name === 'broadcast') {  //When name == broadcast it causes a hicup in the process somewhere which then requires a Phantom emit before any data is sent to the client
				continue;
			}

			SocketMVC[name] = SocketMVC.socket[name];
		}
		_debug('SocketMVC methods set', 'info');

		SocketMVC.hasInit = true;
		_runQueuedEvents();
	};

	var _runQueuedEvents = function() {
		async.parallel(SocketMVC.eventQueue, function(err, data) {
			_debug('Finished running queued events', 'info');
			_debug('SocketMVC is fully operational', 'info');
		});
	};

	var _addOnToQueue = function(event, cb) {
		_debug('SocketMVC on event queued.  Event: ' + event, 'info');
		SocketMVC.eventQueue.push( 
			function(callback) {
				SocketMVC.socket.on(event, cb);
				callback();
			}
		);
	};

	var _addEveryoneToQueue = function(event, cb) {
		_debug('SocketMVC everyone event queued.  Event: ' + event, 'info');
		SocketMVC.eventQueue.push(
			function(callback) {
				SocketMVC.everyone(event, cb);
				callback();
			}
		);
	};

	var _options = {
			debug: true,
			filePath: null
		};

	var _debug = function(message, type) {
		if (_options.debug) {
			switch(type) {
				case 'info':
					console.log('   SocketMVC:  '.grey + type.grey + ' - '.grey + message.green);
					break;
				case 'error':
					console.log('   SocketMVC:  '.grey + type.grey + ' - '.grey + message.red);
					break;
				default:
					console.log('   SocketMVC:  '.grey + type.grey + ' - '.grey + message.green);
			}
		}
	};

	SocketMVC.io = null;

	SocketMVC.socket = {};

	SocketMVC.hasInit = false;

	SocketMVC.eventQueue = [];

	SocketMVC.emit = function(event, cb) {
		//will be replaced once socketMVC is intialized
		if (!SocketMVC.hasInit) {
			_debug('SocketMVC emit event queued.  Event: ' + event + ', Data: ' + cb, 'info');
			SocketMVC.eventQueue.push(
				function(callback) {
					SocketMVC.socket.emit(event, cb);
					callback();
				}
			);
			return;
		}
	}

	SocketMVC.broadcast = function(event, cb) {
		if (!SocketMVC.hasInit) {
			_debug('SocketMVC broadcast event queued.  Event: ' + event + ', Data: ' + cb, 'info');
			SocketMVC.eventQueue.push(
				function(callback) {
					SocketMVC.socket.broadcast.emit(event, cb);
					callback();
				}
			);
			return;
		}

		SocketMVC.socket.broadcast.emit(event, cb);
	}

	SocketMVC.on = function(event, cb) {
		if (!SocketMVC.hasInit) {
			_addOnToQueue(event, cb);
			return;
		}

		SocketMVC.socket.on(event, cb);
	}

	SocketMVC.everyone = function(event, cb) {
		if (!SocketMVC.hasInit) {
			_addEveryoneToQueue(event, cb);
			return;
		}

		SocketMVC.io.sockets.emit(event, cb);
	}

	SocketMVC.init = function(io, socket, options) {
		_options = _.extend(_options, options);
		
		_debug('SocketMVC Init Start', 'info');
		_debug('Options set ' + JSON.stringify(_options), 'info');

		if (_.isArray(_options.filePath)) {
			for (var i = 0; i < _options.filePath.length; i++) {
				_debug('Bootstraping socket listener file ' + _options.filePath[i], 'info');
				require(path.resolve(__dirname, '../', '../', '../', _options.filePath[i]))(socket);
			}
		} else if (!_.isEmpty(_options.filePath) && typeof _options.filePath === 'string') {
			_debug('Bootstraping socket listener file ' + _options.filePath, 'info');
			require(path.resolve(__dirname, '../', '../', '../', _options.filePath))(socket);
		}

		_setSocket(io, socket);
	};

}(exports));

