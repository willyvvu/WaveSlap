
class NetworkedPlayer extends Phaser.Sprite {

  constructor(message) {
    //if(message.id.charCodeAt(0)%2 == 0){
      super(game, 23*UNIT_SCALE , 23*UNIT_SCALE, 'maingirl4');
    //} else {
      //super(game, 100 , 100, 'char1');
    //}
    this.frame = 0;
    this.animations.add('slap', [1, 0], 6, true);

    this.slapping = false;

    this.anchor.set(0.5);
    this.scale.set(0.4);


    // console.log(this)
    this.id = message.id;

    // Game Variables
    this.powerup = 0;
    this.shock = 0; // positive if you can't move... counts down

    this.score = 0;
    this.lastHitBy = null;
    this.dying = 0;
    this.invincible = 0;

    // Handles the offset between local position and server position
    this.deltaPosition = new Phaser.Point(0, 0);
    this.smoothing = 0.8; // How smooth is the position update?
    this.immediateMove = true;

    // Cache messages
    this.cache = {};

    // Phasor Constructor code here
    this.enableBody = true;
    game.add.existing(this);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.bounce.set(0.5);
    this.body.drag.set(1000.0);
    this.body.friction.set(0.0);
    // this.body.moves = false;
    this.body.collideWorldBounds = true;
    // console.log("body: ",this.body)
    playerGroup.add(this);// See main.js:create() where playerGroup is set

    this.score_label = game.add.text(29,20,"",{font: "40px Courier", fill:"#ffffff"});
    this.addChild(this.score_label);
    this.score_label.anchor.setTo(0.5);
    this.score_label.x = 0;
    this.score_label.y= -100;

    this.receiveMessage(message);
  }

  receiveMessage(message){
    var needsUpdate = false;

    // Invalidate velocity cache if player is bumped (physics engine!)
    if(this.cache["vx"] != this.body.velocity.x){
      delete this.cache["vx"];
    }
    if(this.cache["vy"] != this.body.velocity.y){
      delete this.cache["vy"];
    }

    for(var key in message){ // Remove keys that didn't make the cut
      if(key !== "id"){ // Don't cache these keys
        if(key[0] === "_"){
          needsUpdate = true;
        }
        else{
          if(this.cache[key] === undefined || this.cache[key] + "" !== message[key] + ""){
            this.cache[key] = message[key];
            needsUpdate = true;
            // console.log("key",key)
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
    var positionNeedsUpdate = false,
        newX = this.x,
        newY = this.y;
    if(message.x !== undefined){
      newX = message.x;
      positionNeedsUpdate = true;
    }
    if(message.y !== undefined){
      newY = message.y;
      positionNeedsUpdate = true;
    }
    if(message.vx !== undefined){
      this.body.velocity.x = message.vx;
      positionNeedsUpdate = true;
    }
    if(message.vy !== undefined){
      this.body.velocity.y = message.vy;
      positionNeedsUpdate = true;
    }
    if(positionNeedsUpdate){
      if (this.body.velocity.x!=0 && this.slapping === false){
        this.frame = 0;
        if(this.body.velocity.x>0){
          this.scale.x = Math.abs(this.scale.x);
          this.score_label.scale.x = Math.abs(this.score_label.scale.x);
        }
        else{
          this.scale.x = -Math.abs(this.scale.x);
          this.score_label.scale.x = -Math.abs(this.score_label.scale.x);
        }
      }
      /*
      else{
        if (this.body.velocity.y<0){
          this.frame = 2;
        } else {
          this.frame=0;
        }
      }
      */
      if(this.immediateMove){
        this.x = newX;
        this.y = newY;
        this.deltaPosition.set(0);
      }
      else{
        this.deltaPosition.set(newX - this.x, newY - this.y);
      }
    }

    //animation
    if (message._a !== undefined){
      this.slapping = false;
      this.animations.stop();
      this.frame = 0;
    }

    if(message._bt !== undefined){
      this.slapping = true;
      this.animations.play('slap');
      [basicmiss1, basicmiss2][game.rnd.integerInRange(0, 1)].play("", 0, 1, false, true);
      fireBullet(message, this);
    }

    if(message._ht !== undefined){
      // Was hit!

      this.lastHitBy = message._hfb;

      var bam = game.add.sprite(this.x, this.y, 'bam');
      bam.anchor.set(0.5);
      bam.frame = Math.floor(Math.random()*3);
      bam.lifespan = 100;

      this.body.velocity.x = message._hvx;
      this.body.velocity.y = message._hvy;

      var selfInvolved = this.id == selfID || message._hfb == selfID;
      if(selfInvolved){
        shake(this.body.velocity.getMagnitude());
      }
      [basicslap1, basicslap2][game.rnd.integerInRange(0, 1)].play("", 0,
        selfInvolved?1:getAudioAmplitude(this)
      , false, true);
      themeCompression = Math.max(themeCompression, 0.2);

      this.shock = Math.min(this.shock + SHELL_SHOCK, SHELL_SHOCK_MAX);
    }
    if(message._gong !== undefined){
      var gongamp = message._gfb==selfID?1:getAudioAmplitude(this);
      [gongsound0, gongsound1, gongsound2][gongsoundCounter++].play("", 0,
        gongamp
      , false, true);
      gongsoundCounter %= 3;
      themeCompression = Math.max(gongamp * 3, themeCompression);

      var vel = new Phaser.Point(0, 0);
      for (var i = -90; i <= 90; i+=30) {
        vel.set(message._gvx, message._gvy);
        vel.rotate(0, 0, i, true);
        fireBullet({
          _bx: message._gx,
          _by: message._gy,
          _bvx: vel.x,
          _bvy: vel.y,
          _bt: GONG_WAVE
        }, {id: "gong"+message._gfb})
      }
    }
    if(message._die !== undefined){
      var dieamp = (this.id == selfID || this.lastHitby == selfID)?1:getAudioAmplitude(this);
      [chickenslap1,chickenslap2,chickenslap3][game.rnd.integerInRange(0,2)].play("", 0, dieamp, false, true);
      themeCompression = Math.max(dieamp, themeCompression);

      this.immediateMove = true; // Make other people snap to their respawn
      this.dying = DEATH_RESPAWN_TIME;
    }
    if(message._spawn !== undefined){
      this.immediateMove = false;
      this.lastHitby = null;
      this.dying = 0;
      this.invincible = INVINCIBLE_RESPAWN_TIME;
      this.frame = 0;
    }
    if(message.pt !== undefined){ // Powerup get!
      if(message._spawn == undefined && this.id == selfID){
        powerup.play("", 0, 1, false, true);
        themeCompression = Math.max(themeCompression, 1);
      }
      //Activate compressor
      this.powerup = message.pt;
    }
    if(message._add !== undefined){
      if(this.id == selfID){
        sendMessage({
          id: this.id,
          score: this.score+1
        });
      }
    }
    if(message.score !== undefined){
      // console.log("score update:"+message.score)
      this.score = message.score;
    }

    // Return the meaningful aspects of the message that changed
    return needsUpdate && message;
  }

  update(){
    this.score_label.setText("kills:" + this.score);

    // Update! Runs every frame
    this.shock = Math.max(0, this.shock - game.time.elapsed);

    // Smooth out the motion
    this.x += this.deltaPosition.x * (1 - this.smoothing);
    this.y += this.deltaPosition.y * (1 - this.smoothing);
    this.deltaPosition.multiply(this.smoothing, this.smoothing);

    if(this.dying > 0){
      this.frame = 2;
      if(this.dying<= game.time.elapsed){//respawn
        if(this.id == selfID){
          // Died!
          spawn();
        }
      }
    }
    this.dying = Math.max(0, this.dying - game.time.elapsed);
    this.invincible = Math.max(0, this.invincible - game.time.elapsed);
    this.alpha = 1 - Math.round(this.invincible/400)%2
  }


  destructor(){
    // Destructor code here
    playerGroup.remove(this, true);
    this.destroy(true);
    this.kill();
  }
}
