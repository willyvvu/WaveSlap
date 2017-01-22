var networkDispatchers = {};

function createNetworkedPlayer(message){
  var type = message.id.startsWith("powup")?NetworkedPowerup:NetworkedPlayer;
  networkDispatchers[message.id] = new (type)(message);
}
function updateNetworkedPlayer(message){
  networkDispatchers[message.id].receiveMessage(message);
}
function deleteNetworkedPlayer(id){
  if(networkDispatchers[id]){
    networkDispatchers[id].destructor();
  }
  delete networkDispatchers[id];
}
function sendMessage(message, localOnly){
  // console.log(message, localOnly)
  var updateNecessary = true;
  if(message._delete !== undefined){
    deleteNetworkedPlayer(message.id);
  }
  else{
    if(networkDispatchers[message.id] === undefined){
      createNetworkedPlayer(message);
    }
    else if(!networkDispatchers[message.id].receiveMessage(message)){
      updateNecessary = false;
    }
  }
  if(!localOnly && updateNecessary) socket.emit("update", message);
}

function currentPlayer(){
  if(window.selfID){
    return networkDispatchers[selfID];
  }
}

function initNetwork(callback){
  socket = io();

  socket.on('connect', function(){
    window.selfID = socket.io.engine.id.slice(0, 5);
    console.log("connected as ", selfID);
    // Create player
    socket.on('welcome', function(allMessages){
      // console.log("Welcome:", allMessages);
      for(var id in allMessages){
        // console.log("welcome message", allMessages[id])
        sendMessage(allMessages[id], true);
      }
      socket.on('update', function(message){
        sendMessage(message, true);
      });
      callback();
    });
  });


}
