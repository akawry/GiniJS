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
				processes['gserver'] = spawn('gserver');
				setTimeout(function(){
					gserver_socket = net.createConnection(9000);
					gserver_socket.on('connect', function(){
						console.log("Conected to the gserver ... ");
					});
				}, 1000);
				
				res.json({}); // ok
			} else {
				res.json({
					error: 'gServer is already running!'
				});
			}
			break;
	}
});

app.post('/console', function(req, res){
	var cons = req.param('console').toLowerCase(),
		cmd = req.param('command'),
		child = processes[cons];
	
	if (child){
		console.log("Sending command to child: ", cons, cmd);
		if (cons === "gserver"){
			console.log("sending via socket");
			gserver_socket.write(cmd);
		} else {
			console.log("sending via stdin");
			child.stdin.write(cmd);
		}
	}
});

/**
 * Pipe output from spawned processes to client
 */

var processes = {};
var gserver_socket = null;

io.sockets.on('connection', function (socket) {
	var process;
	for (var p in processes){
		process = processes[p];
		process.stdout.on('data', function(data){
			console.log("Emitting to client: ", data);
			socket.emit('process_msg', {
				msg: data,
				process: p
			});
		});
		if (p === "gserver"){
			setTimeout(function(){
				console.log("Attaching listener to gserver socket for incoming data .... ");
				gserver_socket.on('data', function(data){
					console.log("Emitting to client (received via socket)", data);
					socket.emit('process_msg', {
						msg: data,
						process: p
					});
				});
			}, 1000);
		}
	}
});
