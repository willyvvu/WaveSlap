splash = {


  preload: function () {

    game.load.image('splash','images/splash.jpg');
    game.load.audio("Splash2_8bit", "audio/Splash2_8bit.ogg");

  },

  create: function() {
    //this.status.setText("click anywhere to start!");
    sp = game.add.sprite(game.world.centerX, game.world.centerY, 'splash');
    sp.scale.setTo(0.5);
    sp.anchor.setTo(0.5);
    statText = game.add.text(game.world.centerX, game.world.centerY, '', { font: "18pt Courier", fill: "#FFFFFF", stroke: "#FFFFFF", strokeThickness: 2 });
    statText.anchor.setTo(0.5);
    statText.setText("Click or Touch to start");
    statText.x = game.width/2;
    statText.y = 0.7* game.height;
    splashAudio = game.add.audio("Splash2_8bit");
    splashAudio.play();

  },
  update: function(){
    statText.alpha = Math.sin(game.time.now/500)*0.5+0.5;
    if(game.input.activePointer.isDown){
      splashAudio.stop();
      game.state.start("Main");
    }
  }
}
