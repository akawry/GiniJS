var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
var spawn = require('child_process').spawn;
var net = require('net');
var fs = require('fs');

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

app.get(/.*\.css/, function(req, res){
	console.log("Serving static css file: %s", req.url);
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
				processes['gserver 1.0.1'] = spawn('gserver');
				res.json({}); // ok
			} else {
				res.json({
					error: 'gServer is already running!'
				});
			}
			
			break;
	}
});

app.post('/download', function(req, res){
	var fname = req.param('filename'),
		gsav = req.param('gsav');
	console.log("Download request: "+fname);
	fs.open(fname, 'w', 0666, function(err, fd){
		fs.writeSync(fd, gsav, 0);
		res.json({}) // ok
	});
});

app.get('/download', function(req, res){
	var fname = req.param('filename');
	fs.open(fname, 'r', 0666, function(err, fd){
		res.download(fname, fname);
	});
});

app.post('/console', function(req, res){
	var cons = req.param('console').toLowerCase(),
		cmd = req.param('command'),
		child = processes[cons];
	
	if (child){
		console.log("Sending command to child: ", cons, cmd);
		console.log("sending via stdin");
		child.stdin.write(cmd);
	}
});

app.post('/login', function(req, res){
	var user = req.param('user'),
		pass = req.param('password');
	console.log("Login request for user: "+user);
	res.json({}); //ok for now 
});

/**
 * Pipe output from spawned processes to client
 */

var processes = {};

io.sockets.on('connection', function (socket) {
	var process;
	for (var p in processes){
		process = processes[p];
		process.stdout.on('data', function(data){
			console.log("Emitting to client: ", data.toString());
			socket.emit('process_msg', {
				msg: data.toString(),
				process: p
			});
		});
		
		process.stderr.on('data', function(data){
			console.log("Got some stderr: " + data);
		});
	}
});
