
var spectator = location.hash == "#spectate";

main ={
  preload: preload,
  create: create,
  update: update
};

var game = new Phaser.Game({
  width:spectator?1000:800,
  height:spectator?1000:450,
  renderer:Phaser.AUTO,
  parent:'phaser-example',
  state: spectator?main:splash,
  resolution: spectator?1:1/2
});

game.state.add('Splash', splash);
game.state.add('Main', main);

function preload() {
    //game.load.image('phaser', 'images/maingirl4.png');

    game.load.image('bullet', 'images/wave_small.png');
    game.load.image('gong','images/gong.png');
    game.load.image('tree','images/tree.png');
    game.load.spritesheet('stones', 'images/wall.jpg', 32, 32);

    //game.load.spritesheet('maingirl4', 'images/maingirl4.png', 130, 120);
    //game.load.spritesheet('maingirlhit4', 'images/maingirlhit4.png', 130, 120);
    game.load.spritesheet('maingirl4', 'images/mainGirlHit.PNG', 130, 120);

    game.load.spritesheet('bam', 'images/bam.png', 120, 100);
    game.load.spritesheet('noimage', 'images/gloves.png', 60, 30);
    game.load.spritesheet('water','images/water.png',100,100);
    game.load.spritesheet('grass','images/grassNight.png',60,60);

    game.load.audio('theme',['audio/TempleByTheSea_8bit.ogg','audio/TempleByTheSea_8bit.mp3']);
    game.load.audio("basicmiss1", ["audio/basicmiss1.ogg","audio/basicmiss1.mp3"]);
    game.load.audio("basicmiss2", ["audio/basicmiss2.ogg","audio/basicmiss2.mp3"]);
    game.load.audio("basicslap1", ["audio/basicslap1.ogg","audio/basicslap1.mp3"]);
    game.load.audio("basicslap2", ["audio/basicslap2.ogg","audio/basicslap2.mp3"]);
    game.load.audio("chickenslap1", ["audio/chickenslap1.ogg","audio/chickenslap1.mp3"]);
    game.load.audio("chickenslap2", ["audio/chickenslap2.ogg","audio/chickenslap2.mp3"]);
    game.load.audio("chickenslap3", ["audio/chickenslap3.ogg","audio/chickenslap3.mp3"]);
    game.load.audio("chickentoss", ["audio/chickentoss.ogg","audio/chickentoss.mp3"]);
    game.load.audio("gong", ["audio/gong.ogg","audio/gong.mp3"]);
    game.load.audio("powerup", ["audio/powerup.ogg","audio/powerup.mp3"]);
}
function getAudioAmplitude(othersprite){
  if(spectator){return 0.1;}
  var magnitudesq =(
    (currentPlayer().x - othersprite.x)*
    (currentPlayer().x - othersprite.x)+
    (currentPlayer().y - othersprite.y)*
    (currentPlayer().y - othersprite.y)
  );
  return Math.min(AUDIO_FALLOFF*AUDIO_FALLOFF/(magnitudesq), 1);
}
function loadAudio(){
  theme = new Phaser.Sound(game, "theme", 1, true);
  themeCompression = 0;
  basicmiss1 = new Phaser.Sound(game, "basicmiss1", 1);
  basicmiss2 = new Phaser.Sound(game, "basicmiss2", 1);
  basicslap1 = new Phaser.Sound(game, "basicslap1", 1);
  basicslap2 = new Phaser.Sound(game, "basicslap2", 1);
  chickenslap1 = new Phaser.Sound(game, "chickenslap1", 1);
  chickenslap2 = new Phaser.Sound(game, "chickenslap2", 1);
  chickenslap3 = new Phaser.Sound(game, "chickenslap3", 1);
  chickentoss = new Phaser.Sound(game, "chickentoss", 1);
  gongsoundCounter = 0;
  gongsound0 = new Phaser.Sound(game, "gong", 1);
  gongsound1 = new Phaser.Sound(game, "gong", 1);
  gongsound2 = new Phaser.Sound(game, "gong", 1);
  powerup = new Phaser.Sound(game, "powerup", 1);
}
function loadLevel(){
  var level = window.level.split("\n");
  SIZE = level[2].split(" ");
  var width = parseInt(SIZE[0]);
  var height = parseInt(SIZE[1]);
  game.world.setBounds(-UNIT_SCALE/2,-UNIT_SCALE/2,width*UNIT_SCALE,height*UNIT_SCALE);
  grass = game.add.tileSprite(-UNIT_SCALE/2,-UNIT_SCALE/2,width*UNIT_SCALE,height*UNIT_SCALE,'grass');

  stones = game.add.group();
  stones.enableBody = true;
  stones.physicsBodyType = Phaser.Physics.ARCADE;

  water = game.add.group();
  water.enableBody = true;
  water.physicsBodyType = Phaser.Physics.ARCADE;

  gong = game.add.group();
  gong.enableBody = true;
  gong.physicsBodyType = Phaser.Physics.ARCADE;

  tree = game.add.group();
  tree.enableBody = true;
  tree.physicsBodyType = Phaser.Physics.ARCADE;

  spawnlocations = [];

  for (var i = 0; i < width * height; i++) {
    var index = 3*i + 4;
    var x = (i % width);
    var y = Math.floor(i / width);
    var r = parseInt(level[index]);
    var g = parseInt(level[index + 1]);
    var b = parseInt(level[index + 2]);
    var hex = (r << 16) + (g << 8) + b;
    switch(hex){
      case 0xffffff:
        // wall
        var c = stones.create(x*UNIT_SCALE, y*UNIT_SCALE, 'stones', game.rnd.integerInRange(0, 36));
        c.scale.set(UNIT_SCALE/32);
        c.anchor.set(0.5);
        c.name = 'stone' + i;
        c.body.immovable = true;
        c.body.bounce.set(1);
        break;
      case 0x0000ff:
        //water
        var w = water.create(x*UNIT_SCALE, y*UNIT_SCALE, 'water', game.rnd.integerInRange(0, 36));
        w.scale.set(UNIT_SCALE / 100);
        w.anchor.set(0.5);
        w.name = 'water' + i;
        w.body.immovable = true;
        break;
      case 0x00ff00:
        // put a tree here
        var tr = tree.create(x*UNIT_SCALE, y*UNIT_SCALE, 'tree', game.rnd.integerInRange(0, 36));
        tr.scale.set(UNIT_SCALE / 100);
        tr.anchor.set(0.5);
        tr.name = 'tree' + i;
        tr.body.immovable = true;
        break;
        break;
      case 0xff0000:
        // Spawn
        spawnlocations.push([x, y]);
        break;
      case 0xffff00:
        //gong
        var g = gong.create(x*UNIT_SCALE, y*UNIT_SCALE, 'gong', game.rnd.integerInRange(0, 36));
        g.scale.set(UNIT_SCALE/100);
        g.anchor.set(0.5);
        g.body.immovable = true;
        break;
    }
  }
  // console.log(level.slice(0,100));
}
var music;

var sprite;
var bullets;
var stones;
var water;
var gong;
var cursors;
var circle;

var spawnlocations;

var bulletTime = 0;
var bullet;

var text1;
var text2;

var lastSentMessage = 0;

var screenshake = new Phaser.Point(0, 0);
// var screenshakeV = new Phaser.Point(0, 0);
var screenshakeDuration = 0;
var screenshakeLastIntensity = 0;
function shake(intensity){
  screenshakeLastIntensity = intensity * 0.05;
  screenshakeDuration = 10;
}

// var screenBright;

function create() {

    loadAudio();
    game.input.addPointer();
    game.input.addPointer();
    // Keep running on lost focus
    loadLevel();

    game.stage.disableVisibilityChange = true;
    game.renderer.renderSession.roundPixels = true;

    game.physics.useElapsedTime = true;

    game.stage.backgroundColor = '#FFFFFF';

    //  This will check Group vs. Group collision (bullets vs. stones!)

    playerGroup = game.add.group();
    playerGroup.enableBody = true;
    playerGroup.physicsBodyType = Phaser.Physics.ARCADE;

    powerupGroup = game.add.group();
    powerupGroup.enableBody = true;
    powerupGroup.physicsBodyType = Phaser.Physics.ARCADE;

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;


    for (var i = 0; i < 256; i++)
    {
        var b = bullets.create(0, 0, 'bullet');
        b.scale.set(0.3);
        b.anchor.set(0.5);
        b.body.setSize(30, 30, -20, 5);
        b.name = 'bullet' + i;
        b.exists = false;
        b.visible = false;
        b.body.bounce.set(1);
        b.body.collideWorldBounds = true;
    }

    hasShot = false;
    hasMoved = false;
    timerHasStarted = false;
    if(!spectator){
        text1 = game.add.text(0, 0, '', { font: "18pt Courier", fill: "#FFFFFF", stroke: "#FFFFFF", strokeThickness: 1 });
        game.stage.addChild(text1);
        text1.setText("touch here to move!\n or ←↑→↓ / WSAD");
        text1.x = 50;
        text1.y = 150;
        text2 = game.add.text(0, 0, '', { font: "18pt Courier", fill: "#FFFFFF", stroke: "#FFFFFF", strokeThickness: 1 });
        game.stage.addChild(text2);
        text2.setText("touch here to aim!\nor mouse / trackpad");
        text2.x = 500;
        text2.y = 150;
    }

    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.SPACEBAR,
      Phaser.Keyboard.W,
      Phaser.Keyboard.A,
      Phaser.Keyboard.S,
      Phaser.Keyboard.D
    ]);

    // screenBright = game.add.graphics(game.width, game.height);
    // game.stage.addChild(screenBright);
    // screenBright.alpha = 0;
    // screenBright.blendMode = PIXI.blendModes.ADD;
    // screenBright.x = 0;
    // screenBright.y = 0;
    // screenBright.beginFill(0xFFFFFF);
    // screenBright.drawRect(0,0, game.width, game.height);
    // screenBright.endFill();


    circle = game.add.graphics(game.width, game.height);
    game.stage.addChild(circle);
    circle.x = 0;
    circle.y = 0;


    initNetwork(function(){
      if(!spectator){
        spawn();
      }
    });

}

function spawn(){
  var spawnSpot = spawnlocations[Math.floor(Math.random() * spawnlocations.length)];
  sendMessage({
    id: selfID,
    x: spawnSpot[0] * UNIT_SCALE,
    y: spawnSpot[1] * UNIT_SCALE,
    pt: 0,
    _spawn: true
  });
}

function updateRecursive(object){
  if(object.update){
    object.update();
  }
  if(object.forEach){
    object.forEach(updateRecursive);
  }
}

var ljoydown = false;
var ljoyx = 0;
var ljoyy = 0;
var rjoydown = false;
var rjoyx = 0;
var rjoyy = 0;
function update() {
    if(theme.isDecoded && !theme.isPlaying){
      theme.play();
    }
    if(theme.isPlaying){
      themeCompression = Math.max(0, themeCompression - game.time.elapsed/1000);
      theme.volume = Math.max(1-themeCompression*2, 0.3);
    }
    var cp = currentPlayer();
    if(cp){
      // Local code, runs for current player only
      var moveX = 0, moveY = 0;
      var aimX = 0, aimY = 0;

      for (var i = 0; i < 2; i++) {
        var pointer = i == 0? game.input.pointer1: game.input.pointer2;
        if(pointer.isDown){
          if(pointer.withinGame){
            if(ljoydown != pointer && rjoydown != pointer) {
              if(pointer.worldX < game.camera.x+game.width/2){
                if(!ljoydown) {
                  ljoydown = pointer;
                  ljoyx = pointer.worldX - game.camera.x;
                  ljoyy = pointer.worldY - game.camera.y;
                }
              }
              else{
                if(!rjoydown) {
                  rjoydown = pointer;
                  rjoyx = pointer.worldX - game.camera.x;
                  rjoyy = pointer.worldY - game.camera.y;
                }
              }
            }
          }
        }
        else if(pointer.isUp){
          if(ljoydown == pointer) {
            ljoydown = false;
          };
          if(rjoydown == pointer){
            rjoydown = false
          };
        }
      }

      circle.clear();
      circle.lineStyle(2, 0xFFFFFF, 0.8);
      if(ljoydown){
        moveX = ljoydown.worldX - game.camera.x - ljoyx;
        moveY = ljoydown.worldY - game.camera.y - ljoyy;
        var magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
        if(magnitude < TOUCHPAD_DEADZONE){
          moveX = moveY = 0;
        }
        circle.drawCircle(ljoyx,ljoyy,TOUCHPAD_RADIUS);
      }
      if(rjoydown){
        aimX = rjoydown.worldX - game.camera.x - rjoyx;
        aimY = rjoydown.worldY - game.camera.y - rjoyy;
        var magnitude = Math.sqrt(aimX * aimX + aimY * aimY);
        if(magnitude < TOUCHPAD_DEADZONE){
          aimX = aimY = 0;
        }
        circle.drawCircle(rjoyx,rjoyy,TOUCHPAD_RADIUS);
      }
   if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A))
      {
        moveX += -TOUCHPAD_RADIUS;
      }
      if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D))
      {
        moveX += TOUCHPAD_RADIUS;
      }
      if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W))
      {
        moveY += -TOUCHPAD_RADIUS;
      }
      if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S))
      {
        moveY += TOUCHPAD_RADIUS;
      }
      // Normalize!
      var magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
      if(magnitude != 0){
        moveX /= magnitude;
        moveY /= magnitude;
      }
      moveX *= PLAYER_SPEED;
      moveY *= PLAYER_SPEED;
      // The bulk of messages will be absorbed by the message cache
      if(cp.shock == 0 && cp.dying == 0){
        if(game.time.now - lastSentMessage > THROTTLE_MESSAGE_TIME){
          lastSentMessage = game.time.now;
          sendMessage({
            "id": selfID,
            "x": Math.round(cp.x),
            "y": Math.round(cp.y),
            "vx": moveX,
            "vy": moveY
          });
          hasMoved = true;
        }
      }
      var magnitude = Math.sqrt(aimX * aimX + aimY * aimY);
      if(magnitude != 0){
        aimX /= magnitude;
        aimY /= magnitude;
      }
      var mouseShooting = game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||  game.input.activePointer.isMouse && game.input.activePointer.isDown;
      if (cp.dying == 0 && (mouseShooting || magnitude > 0))
      {

        if (game.time.now > bulletTime)
          {
            bulletTime = game.time.now + SLAP_RATE[cp.powerup];

            var rotation = Math.round(100*(mouseShooting? game.physics.arcade.angleToPointer(cp): Math.atan2(aimY, aimX)))/100;
            var velocity = SLAP_VELOCITY[cp.powerup];
            //console.log(cp.powerup)
            sendMessage({ // Please refactor these
              "id": selfID,
              "_bt": cp.powerup, //Bullet type 0:basic; 1:long reflective;
              "_bx": Math.round(cp.x), // Bullet X position
              "_by": Math.round(cp.y), // Bullet Y position
              "_bvx": /*cp.body.velocity.x + */Math.round(velocity * Math.cos(rotation)), // Bullet X velocity
              "_bvy": /*cp.body.velocity.y + */Math.round(velocity * Math.sin(rotation)) // Bullet Y velocity
            });
            hasShot = true;
          // }
        }
      } else {
        sendMessage({ //start animation
              "id": selfID,
              "_a": false, //animation
            });
      }
    }
    else if(spectator){
      game.camera.x = 0;
      game.camera.y = 0;
      game.camera.scale.set(1000/(UNIT_SCALE*50));
    }
    if(hasShot && hasMoved && !timerHasStarted&& text1.exists){
      timerHasStarted = true;
      game.time.events.add(Phaser.Timer.SECOND * 2, killText, self);
    }
    updateRecursive(game.stage);
    //  As we don't need to exchange any velocities or motion we can the 'overlap' check instead of 'collide'
    // game.physics.arcade.overlap(stones, bullets, bulletSelfCollision, null, this);

    game.physics.arcade.collide(bullets);//, bullets, bulletSelfCollision, null, this);
    game.physics.arcade.collide(bullets,stones);

    game.physics.arcade.overlap(playerGroup, bullets, bulletPlayerCollision, null, this);

    game.physics.arcade.overlap(playerGroup, powerupGroup, playerPowerupCollision, null, this);

    game.physics.arcade.collide(playerGroup, playerGroup, null, testPlayerCollision);

    game.physics.arcade.collide(playerGroup,stones);
    game.physics.arcade.overlap(gong, bullets, gongBulletCollision, null, this);
    game.physics.arcade.overlap(playerGroup, water, playerWaterCollision);

    // sprite.body.velocity.x = 0;
    // sprite.body.velocity.y = 0;
    // Face the bullets properly
    bullets.forEach(function(bullet){
      bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
      // game.debug.body(bullet, "#ff0000");
    });
    if(cp){
      game.camera.x = cp.x - game.width/2;
      game.camera.y = cp.y - game.height/2;
      // game.camera.follow(cp, Phaser.FOLLOW_LOCKON);
      // Screenshake
      if(screenshakeDuration > 0){
        // screenBright.alpha = screenshakeDuration / 10;
        screenshakeDuration --;
        screenshake.x += (Math.random() - 0.5) *screenshakeLastIntensity;
        screenshake.y += (Math.random() - 0.5) *screenshakeLastIntensity;
      }
      screenshake.multiply(0.8, 0.8);
      game.camera.x += screenshake.x;
      game.camera.y += screenshake.y;

    }
}

function killText(){
  text1.kill();
  text2.kill();
}
function fireBullet (message, player) {

  bullet = bullets.getFirstExists(false);

  if (bullet)
  {
    bullet.firedBy = player.id;
    bullet.reset(message._bx, message._by);
    bullet.type = message._bt;
    bullet.tint = [
      0xffffff,
      0xff0000,
      0x0000ff,
      0xffb50a
    ][message._bt];
    bullet.body.velocity.set(message._bvx, message._bvy);
    //bullet.rotation;

    bullet.lifespan = SLAP_LIFESPAN[bullet.type];
    bullet.checkWorldBounds = true;
  }
}


function bulletSelfCollision(bullet1, bullet2) {
  if(bullet1.exists && bullet2.exists && bullet1.firedBy!=bullet2.firedBy){
    bullet1.kill();
    bullet2.kill();
  }
}
function bulletPlayerCollision(opponent, bullet) {
  if(bullet.firedBy == "gong" + selfID || bullet.firedBy == selfID && opponent.id != selfID){
    //bam graphics
  bullet.kill();//KO!
    sendMessage({
      id:opponent.id,
      _ht:bullet.type,
      _hfb:bullet.firedBy,
      _hvx:opponent.body.velocity.x + bullet.body.velocity.x,
      _hvy:opponent.body.velocity.y + bullet.body.velocity.y
     });
    //loose powerup when hit
    sendMessage({
      id: opponent.id,
      pt: 0
    });
  }
}
function testPlayerCollision(player1, player2){
  return player1.shock != 0 || player2.shock != 0;
}

function playerPowerupCollision (player, powerup) {
  if (player.id === selfID){
    sendMessage({
      id: player.id,
      pt: powerup.pt
    });
    sendMessage({
      id:powerup.id,
      _delete:true
    });
    powerup.kill();
  }
}
function gongBulletCollision (gong, bullet){
  // console.log(bullet, bullet.firedBy);
  if(!bullet.firedBy.startsWith("gong")){
    bullet.kill();
    if(bullet.firedBy == selfID){
      sendMessage({
        id: bullet.firedBy,
        _gfb: bullet.firedBy,
        _gx: gong.x,
        _gy: gong.y,
        _gvx: bullet.body.velocity.x,
        _gvy: bullet.body.velocity.y,
        _gong: true
      });
    }
  }
}
function playerWaterCollision (player, water){
  if(player.id == selfID && player.dying == 0&& player.invincible == 0){

    // console.log("Kill by " +player.lastHitBy)
    if(player.lastHitBy !== null && !player.lastHitBy.startsWith("gong")){
      sendMessage({
        id: player.lastHitBy,
        _add: true
      });
      sendMessage({
        id: player.id,
        _die: true
      });
    }
    else{
      // Self kill, or kill by gong
      // console.log("selfdeath")
      sendMessage({
        id: player.id,
        score: Math.max(0, player.score-1),
        _die: true
      });
    }
  }
}
