var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var spawn = require('child_process').spawn;
var net = require('net');

/**
 * Serve static files 
 */

app.use(express.bodyParser());

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});

app.get(/.*\.js/, function(req, res){
	console.log("Serving static js file: %s", req.url);
	res.sendfile(__dirname + '/' + req.url);
});

app.get(/.*\.(gif|png)/, function(req, res){
	console.log("Serving static image file: %s", req.url);
	res.sendfile(__dirname + '/' + req.url);
});

app.listen(9000, function(){
	console.log("listening on port 9000...");
});

/**
 * Process commands here 
 */

app.post('/command', function(req, res){
	var type = req.param('type');
	console.log("Received command: ", type);
	switch (type){
		case "start_server":
			
			if (!processes['gserver']){
				console.log("Spawning gServer process...");
				processes['gserver'] = spawn('gserver', [33001]);
				res.json({}); // ok
			} else {
				res.json({
					error: 'gServer is already running!'
				});
			}
			break;
	}
});

/**
 * Pipe output from spawned processes to client
 */

var processes = {};
var gserver_socket = null;

io.sockets.on('connection', function (socket) {
	
	var gserv = process['gserver'];
	if (gserv){
		// need some timeout to let the gserver start up!
		setTimeout(function(){
			gserver_socket = net.createConnection(33001);
			gserver_socket.on('connect', function(){
				console.log("Conected to the gserver ... ");
			});
			gserver_socket.on('data', function(data){
				console.log("Got some gserver data:", data);
				socket.emit('gserver', {
					msg: data
				});
			});
			
			gserv.stdout.on('data', function(data){
				console.log("Got some gserver data:", data);
				socket.emit('gserver', {
					msg: data
				});
			});
			
		}, 1000);
	}
});
