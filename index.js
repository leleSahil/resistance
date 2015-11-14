var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile('index.html');
});



var rebelScore = 0;
var spyScore   = 0;

var clients = {};
var usernames = [];
var spies = [];


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('set username', function(name){
    console.log('user added: ' + name);
    clients[name] = socket;
    usernames.push(name);
    io.emit('new user', name);
    if (tryStartingGame())
    	//function to proceed the game, maybe make some function like "main"

  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});


function tryStartingGame() {
	if(usernames.length == 5)
		return true;
	else
		return false;
}

function assignTeams() {
	int spyIndex1 = getRandomInt(0,5);
	int spyIndex2 = getRandomInt(0,5);
	while(spyIndex1 == spyIndex2)
		spyIndex2 = getRandomInt(0,5);

	spies.push(usernames[spyIndex1]);
	spies.push(usernames[spyIndex2]);
}

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}