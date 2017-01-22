var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('.'))

http.listen(80, function(){
  console.log('Server started.');
});

var messageCache = {};
var connections = 0;

function updateMessage(message, socket){
  if(message._delete){
    delete messageCache[message.id];
  }
  else{
    if(messageCache[message.id] === undefined){
      messageCache[message.id] = {};
    }
    // Strip event tags from cache
    for(var key in message){
      if(key[0] !== "_"){
        messageCache[message.id][key] = message[key];
      }
    }
  }
  (socket === undefined? io: socket.broadcast).emit('update', message);
}

io.on('connection', function(socket){
  // console.log('Connected:', socket.id.slice(0, 5));
  console.log((++connections) + " players connected");

  // console.log(messageCache);
  socket.emit('welcome', messageCache);

  socket.on('update', function(message){
    // console.log('Update', message);
    updateMessage(message, socket);
  })

  socket.on('disconnect', function(){
    // console.log('Disconnected:', socket.id.slice(0, 5));
    console.log((--connections) + " players connected");
    updateMessage({
      "id": socket.id.slice(0, 5),
      "_delete": true
    });
  });
});

var currentPowerup = 0;
var maxPowerups = 6;
var UNIT_SCALE = 50;
var powerupPositions = [
  [7,6],
  [36,2],
  [8,24],
  [46,24],
  [13,37],
  [27,41],
  [41,44]
];
function placePowerup(){
  updateMessage({
    "id":"powup"+currentPowerup,
    "x": powerupPositions[currentPowerup][0] * UNIT_SCALE,
    "y": powerupPositions[currentPowerup][1] * UNIT_SCALE,
    "pt": Math.floor(3 * Math.random())//Powerup type
  })

  currentPowerup++;
  if(currentPowerup >= maxPowerups) currentPowerup = 0;

  setTimeout(placePowerup, 2000);
}
placePowerup();
