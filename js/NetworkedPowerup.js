
class NetworkedPowerup extends Phaser.Sprite {

  constructor(message) {
    super(game, 0 , 0, 'noimage');

    this.anchor.set(0.5);

    // console.log(this)
    this.id = message.id;

    this.pt = 0;
    // Cache messages
    this.cache = {};

    // Phasor Constructor code here
    this.enableBody = true;
    game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    // this.body.immovable = true;
    this.body.bounce.set(0, 0);
    this.body.friction.set(1.0, 1.0);
    // this.body.moves = false;
    this.body.collideWorldBounds = true;
    powerupGroup.add(this);// See main.js:create() where powerupGroup is set
    // console.log("body: ",this.body)

    // console.log("please work")

    this.receiveMessage(message);
  }

  receiveMessage(message){
    var needsUpdate = false;

    for(var key in message){ // Remove keys that didn't make the cut
      if(key !== "id"){ // Don't cache these keys
        if(key[0] === "_"){
          needsUpdate = true;
        }
        else{
          if(this.cache[key] === undefined || this.cache[key] + "" !== message[key] + ""){
            this.cache[key] = message[key];
            needsUpdate = true;
          }
          else{
            delete message[key];
          }
        }
      }
    }
    // Handle message received
    // console.log(message);

    // Handle positioning
    if(message.x !== undefined){
      this.x = message.x;
    }
    if(message.y !== undefined){
      this.y = message.y;
    }
    if(message.pt !== undefined){
      this.frame = [2, 0, 1][message.pt];
      this.pt = message.pt;
    }

    // Return the meaningful aspects of the message that changed
    return needsUpdate && message;
  }

  update(){
    // Update! Runs every frame
  }


  destructor(){
    // Destructor code here
    powerupGroup.remove(this, true);
    this.kill();
    this.destroy(true);
  }
}
