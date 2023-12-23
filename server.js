// Database to store data, don't forget autoload: true
var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

// We need the file system here
var fs = require('fs');
				
// Express is a node module for building HTTP servers
var express = require('express');
var app = express();

// Tell Express to look in the "public" folder for any files first
app.use(express.static('public'));

// If the user just goes to the "route" / then run this function
app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Here is the actual HTTP server 
// In this case, HTTPS (secure) server
var https = require('https');

// Security options - key and certificate
var options = {
	key: fs.readFileSync(''),
	cert: fs.readFileSync('')
  };

// We pass in the Express object and the options object
var httpServer = https.createServer(options, app);

// Default HTTPS port
httpServer.listen(443);
// WebSocket Portion
// WebSockets work with the HTTP server
const { Server } = require('socket.io');
const io = new Server(httpServer, {});

//var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
		// Find all of the existing docs in the database
		db.find({}).sort({ timestamp: 1 }).exec(function (err, docs) {
			// Loop through the results, send each one as if it were a new chat message
			for (var i = 0; i < docs.length; i++) {
				socket.emit('draw', docs[i]);
			}
		});

		socket.on('draw', function(data) {

			data.timestamp = Date.now();

			// Insert the data into the database
			db.insert(data, function (err, newDocs) {
				if (err) console.log("err: " + err);
				//console.log("newDocs: " + newDocs);
			});

			socket.broadcast.emit('draw', data);
		});

		socket.on('clear', function() {
			socket.broadcast.emit('clear', {});
			db.remove({}, { multi: true }, function(err, numRemoved) {
				if (err) console.log("err: " + err)
				console.log("Cleared: " + numRemoved);
			});
		});
		
		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
