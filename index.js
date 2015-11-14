var app = require('express')();
var express = require('express');
var path = require('path');

app.use(express.static(path.join(__dirname, '.')));

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});



var rebelScore = 0;
var spyScore   = 0;

var clients = {};
var usernames = [];
var spies = [];
var missionleader;
var selections = [];
var round;
var people_per_round = [2, 3, 3, 2, 3];
var mission_approves = 0;
var mission_rejects = 0;

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
      });

  socket.on('set username', function(name) {
    console.log('user added: ' + name);
    clients[name] = socket;
    usernames.push(name);
    io.emit('new user', name);

    if (tryStartingGame()) {
      assignTeams();
    	//function to proceed the game, maybe make some function like "main"
      for (var i=0; i<usernames.length; i++) {
        if(usernames[i].localeCompare(spies[0]) == 0 || usernames[i].localeCompare(spies[1]) == 0) { // is a spy
          socket.emit('team assignment', 'spy');
          socket.emit('other spies', "" + spies[0] + " " + spies[1]);
        } else {
          socket.emit('team assignment', 'resistance');
        }
      }
      io.emit('start game', "");
      missionleader = getRandomInt(0,5);
      io.emit('missionleader', usernames[missionleader]); // send mission leader
    }
      });

  socket.on('select player', function(select_player) {
	  selections = selections.push(select_player);
	  io.emit('select player', select_player);
      });

  socket.on('deselect player', function(deselect_player) {
	  for(var i=0; i<selections.length; i++) {
	      if(selections[i].localeCompare == 0) {
		  selections.splice(i, 1);
	      }
	  }
	  io.emit('deselect player', deselect_player);
      });

  socket.on('lock selections', function(){
	  io.emit('lock selections');
      });

  socket.on('mission approve', function(){
	  mission_approves += 1;
	  if(mission_approves == 3){
	      io.emit('majority approve');
	      mission_approves = 0;
	  }
	  else {
	      io.emit('mission approve');
	  }
      });

  socket.on('misson reject', function(){
	  mission_approves += 1;
	  if(mission_approves == 3){
	      io.emit('majority reject');
	      mission_reject = 0;
	  }
	  else {
	      io.emit('mission reject');
	  }
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
	var spyIndex1 = getRandomInt(0,5);
	var spyIndex2 = getRandomInt(0,5);
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