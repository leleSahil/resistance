var express = require('express');
var app = require('express')();
var path = require('path');

app.use(express.static(path.join(__dirname, '')));

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
var mission_succeed = true;
var num_votes = 0;

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit("missionleader", "Sahil");

  socket.on('disconnect', function(){
    console.log('user disconnected');
      });

  socket.on('set username', function(name) {
    console.log('user added: ' + name);
    clients[name] = socket;
    usernames.push(name);
    io.emit('new user', usernames);

    if (tryStartingGame()) {
      assignTeams();
      round = 0;
    	//function to proceed the game, maybe make some function like "main"
      for (var i=0; i<usernames.length; i++) {
        if(usernames[i].localeCompare(spies[0]) == 0 || usernames[i].localeCompare(spies[1]) == 0) { // is a spy
          //socket.emit('team assignment', 'spy');
          //socket.emit('other spies', "" + spies[0] + " " + spies[1]);
          socket.emit(spies);
        } 
        // else {
        //   socket.emit('team assignment', 'resistance');
        // }
      }
      io.emit('start game', "");
      missionleader = getRandomInt(0,5);
      io.emit('missionleader', usernames[missionleader]); // send mission leader
    }
      });

  socket.on('select player', function(select_player) {
	  selections.push(select_player);
    console.log('Player selected');
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

  socket.on('mission approve', function(username){
	  mission_approves += 1;
    console.log("Button is working nice lady");
	  if(mission_approves == 3){
	      io.emit('majority approve');
	      mission_approves = 0;
	  }
	  else {
	      io.emit('mission approve', username);
	  }
  });

  socket.on('misson reject', function(){
	  mission_rejects += 1;
	  if(mission_rejects == 3){
	      io.emit('majority reject');
	      mission_rejects = 0;
	      updateMissionLeader();
	  }
	  else {
	      io.emit('mission reject');
	  }
  });
    

  socket.on('mission succeed', function(){
    num_votes += 1;
    tryCompleteMission();
  });

  socket.on('mission fail', function(){
    num_votes += 1;
    mission_succeed = false;
  });
});

/*var server = http.createServer();
server.listen(3000, 'resistmob.cloudapp.net');
console.log('listening on *:3000');*/

http.listen(8000, "0.0.0.0", function(){
  console.log('listening on *:8000');
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

function updateMissionLeader(){
    missionLeader += 1;
    if(missionLeader = 5){
	   missionLeader = 0;
    }
    io.emit('missionleader', usernames[missionleader]); // send mission leader
}

function tryCompleteMission(){
  if(num_votes == people_per_round[round]){
    if(mission_succeed){
      io.emit('mission succeeded');
      round += 1;
      rebelScore +=1;
    }
    else{
      io.emit('mission failed');
      spyScore += 1;
    }

    if(rebelScore == 3){
      io.emit('rebels win');
      //emit rebel and spy names
    }
    else if(spyScore == 3){
      io.emit('spies win');
    }
    else{
      updateMissionLeader();
    }
  } 
}
