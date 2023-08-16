const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.5;

/* background */
const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 175,
  },
  imageSrc: "./img/shop.png",
  scale: 2.5,
  framesMax: 6,
});

/* player */
const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/paus/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 155,
  },
  sprites: {
    idle: {
      imageSrc: "./img/paus/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/paus/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/paus/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/paus/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/paus/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/paus/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/paus/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 155,
    height: 50,
  },
});

/* enemy */
const enemy = new Fighter({
  position: {
    x: 400,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  color: "blue",
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./img/cipung/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 170,
  },
  sprites: {
    idle: {
      imageSrc: "./img/cipung/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/cipung/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/cipung/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/cipung/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/cipung/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/cipung/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/cipung/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

decreaseTimer();

/* animate */
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgb(255, 255, 255, 0.1";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  /* player movement */

  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  /* jumping */
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }
  /* enemy movement */
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  /* detect for collision and enemy get hit */
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }

  /* if player misses */
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  /* this is where player get hit */

  /* rectangularCOllision */
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  /* if enemy misses */
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  /* end game based on health */
  if (enemy.health <= 0 || player.health <= 0) {
    determineWInner({ player, enemy, timerId });
  }
}

animate();

/* event listener */
window.addEventListener("keydown", (Event) => {
  if (!player.dead) {
    /* players key */
    switch (Event.key) {
      case "d":
        keys.d.pressed = true;
        player.lastKey = "d";
        break;
      case "a":
        keys.a.pressed = true;
        player.lastKey = "a";
        break;
      case "w":
        player.velocity.y = -15;
        break;
      case " ":
        player.attack();
        break;

      /* enemy keys */
    }
  }

  if (!enemy.dead) {
    switch (Event.key) {
      case "ArrowRight":
        keys.ArrowRight.pressed = true;
        enemy.lastKey = "ArrowRight";

        break;
      case "ArrowLeft":
        keys.ArrowLeft.pressed = true;
        enemy.lastKey = "ArrowLeft";
        break;
      case "ArrowUp":
        enemy.velocity.y = -15;
        break;
      case "ArrowDown":
        enemy.attack();
        break;
    }
  }

  console.log(Event.key);
});

window.addEventListener("keyup", (Event) => {
  switch (Event.key) {
    /* player keys */
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  /* enemy keys */
  switch (Event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }

  console.log(Event.key);
});
