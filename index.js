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


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('set username', function(msg){
    console.log('user added: ' + msg);
    clients[msg] = socket;
    usernames.push(msg);
    io.emit('new user', msg);
    if (tryStartingGame())
    	//function to proceed the game

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