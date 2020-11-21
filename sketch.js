var snake;
var pixel_size = 20;
var shots = [];
var movement = [];
var score = 0;
var mode = ""
var gameState = 'init';
var timer_set = 60
var button_arrow = [
  [300, 450],
  [350, 500],
  [300, 550],
  [250, 500]
]
var diameter = 50
var name = ""
var input
var img_slow, img_med, img_fast
var image_loc = [[40, 320], [150, 320], [260, 320]]
var image_size = 64
let highscore = []
var song1
var frame = 10

function preload() {
  // get data from firestore
  firebase.firestore().collection("Records").orderBy("score", "desc").limit(5)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, " => ", doc.data());
        if (doc.data()['name'] == "") {
          highscore.push(["Anonymous", doc.data()['score'], doc.data()['time'], doc.data()['mode']])
        }
        else {
          highscore.push([doc.data()['name'], doc.data()['score'], doc.data()['time'], doc.data()['mode']])
        }
      });
    })
  img_slow = loadImage("slow.png")
  img_med = loadImage("slow.png")
  img_fast = loadImage("slow.png")
}

function setup() {
  createCanvas(400, 600);
  frameRate(10);
}

function initGame() {
  // background color
  background(152, 113, 153);

  //draw SNAKE GAME
  textSize(55);
  fill(237, 209, 233)
  text("SNAKE GAME", 20, 130);

  // draw snake icon
  noFill()
  strokeWeight(8)
  beginShape();
  vertex(180, 160);
  quadraticVertex(220, 160, 190, 190);
  quadraticVertex(160, 220, 230, 210);
  circle(176, 160, 8)
  circle(167, 161, 9)
  circle(171, 154, 5)
  endShape();
  strokeWeight(1);
  noStroke()
  fill(255, 181, 251)
  circle(171, 155, 6)

  // draw game instructions
  fill(139, 214, 189, 200);
  rect(0, 420, 400, 180);
  stroke(0, 0, 0)
  fill(150, 39, 69);
  rect(50, 450, 20, 20);
  fill(235, 196, 59);
  rect(50, 490, 20, 20);
  fill(66, 61, 122);
  rect(50, 530, 20, 20);
  noStroke()
  fill(54, 52, 53)
  textSize(20)
  text("+10 score", 100, 467);
  text("+ 3  score", 100, 507);
  text("+ 1  score", 100, 547);
  textSize(15)
  fill(54, 52, 53)
  text("Limited time", 260, 470);
  textSize(40)
  fill(255, 0, 0)
  text("60s", 270, 520);

  // draw input name box + highscore
  nameWidht = textWidth(name);
  textSize(20)
  fill(139, 214, 189);
  text("Your name:", 50, 250);
  input = createInput("").attribute('maxlength', 10);
  input.position(160, 250);
  text("Top player: " + highscore[0][0] + " - Score: " + highscore[0][1], 50, 290);

  // draw mode selection
  textSize(15)
  var level = "TRANQUIL"
  text(level, image_loc[0][0] + image_size / 2, image_loc[0][1] - 5);
  image(img_slow, image_loc[0][0], image_loc[0][1]);
  level = "WINDY"
  text(level, image_loc[1][0] + image_size / 2, image_loc[1][1] - 5);
  image(img_med, image_loc[1][0], image_loc[1][1]);
  level = "STORM"
  text(level, image_loc[2][0] + image_size / 2, image_loc[2][1] - 5);
  image(img_fast, image_loc[2][0], image_loc[2][1]);

  noLoop();
}

function helloworld() {
  removeElements();
  name = input.value();

  // restart game metrics
  timer = timer_set
  score = 0
  gameState = 'play';
  frameCount = 1

  // create Snake object
  snake = new Snake();
  setJelloShots(3, "green");
  setJelloShots(1, "red");
  setJelloShots(2, "yellow");
  loop();
}

function rotatePoint(point, degree, center) {
  // helper for arrow function
  degree = radians(degree);
  var x = point[0]
  var y = point[1]
  point[0] = x * cos(degree) - y * sin(degree) + center[0];
  point[1] = x * sin(degree) + y * cos(degree) + center[1];
  return point
}

function arrow(x, y, r, a) {
  // draw arrows with specific direction
  noStroke()
  fill(71, 89, 97)
  circle(x, y, r)
  fill(217, 163, 199)
  var t1 = rotatePoint([0, -r / 3], a, [x, y])
  var t2 = rotatePoint([-r / 4, -r / 5], a, [x, y])
  var t3 = rotatePoint([r / 4, -r / 5], a, [x, y])
  var w = r / 4.7
  var h = r / 2.5
  var q1 = rotatePoint([-r / 9, -r / 5], a, [x, y])
  var q2 = rotatePoint([-r / 9 + w, -r / 5], a, [x, y])
  var q3 = rotatePoint([-r / 9 + w, -r / 5 + h], a, [x, y])
  var q4 = rotatePoint([-r / 9, -r / 5 + h], a, [x, y])
  triangle(t1[0], t1[1], t2[0], t2[1], t3[0], t3[1]);
  quad(q1[0], q1[1], q2[0], q2[1], q3[0], q3[1], q4[0], q4[1])
}

function runGame() {
  //print(mouseX, mouseY)
  background(152, 113, 153);

  // update Snake
  snake.update();
  snake.show();
  snake.checkDeath();

  // draw control box
  noStroke()
  fill(139, 214, 189);
  rect(0, 420, 400, 180);
  arrow(button_arrow[0][0], button_arrow[0][1], diameter, 0)
  arrow(button_arrow[1][0], button_arrow[1][1], diameter, 90)
  arrow(button_arrow[2][0], button_arrow[2][1], diameter, 180)
  arrow(button_arrow[3][0], button_arrow[3][1], diameter, 270)

  // draw updated score
  textSize(15);
  fill(255);
  if (name == "") {
    name = "Anonymous"
  }
  text("Name: " + name, 20, 440);
  text("Score: " + score, 20, 460);
  text("Top: " + highscore[0][0] + " " + highscore[0][1], 20, 480);
  fill(255, 181, 251)

  // draw Timer
  fill(200, 38, 38);
  textSize(60);
  text(timer, 50, 550);
  if (frameCount % frame == 0 && timer > 0) {
    timer--;
  }

  // add more shots at specific times
  if (frameCount % (frame * 30) == 0 || frameCount % (frame * 40) == 0 ||
    frameCount % (frame * 50) == 0 || frameCount % (frame * 55) == 0) {
    setJelloShots(3, "green");
    setJelloShots(1, "red");
    setJelloShots(2, "yellow");
  }

  // draw again the eaten shots
  for (var i = 0; i < shots.length; i++) {
    stroke(0, 0, 0)
    if (shots[i][1] == "red") {
      fill(166, 47, 38)
    } else if (shots[i][1] == "yellow") {
      fill(235, 196, 59)
    } else if (shots[i][1] == "green") {
      fill(66, 61, 122)
    }
    rect(shots[i][0].x, shots[i][0].y, pixel_size, pixel_size);
    if (snake.eat(shots[i])) {
      snake.tail.push(createVector(shots[i][0].x, shots[i][0].y));
      var eaten = shots.splice(i, 1);
      // update score when snake eat the shots
      if (eaten[0][1] == "red") {
        setJelloShots(1, "red");
        score += 10
      } else if (eaten[0][1] == "yellow") {
        setJelloShots(1, "yellow");
        score += 3
      } else if (eaten[0][1] == "green") {
        setJelloShots(1, "green");
        score += 1
      }
    }
  }
}

function updateGame() {
  // get current time
  var time = nf(year(), 4, 0) + "-" + nf(month(), 2, 0) + "-" + nf(day(), 2, 0) + " " + nf(hour(), 2, 0) + ":" + nf(minute(), 2, 0) + ":" + nf(second(), 2, 0)

  // send new doc to firestore
  firebase.firestore().collection("Records").doc(time).set({
    name: name,
    score: score,
    time: time,
    mode: mode
  }).then(function () {
    console.log("New document successfully written!");
  })
  highscore = []

  // get sorted data to firestore
  firebase.firestore().collection("Records").orderBy("score", "desc").limit(5).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      if (doc.data()['name'] == "") {
        highscore.push(["Anonymous", doc.data()['score'], doc.data()['time'], doc.data()['mode']])
      }
      else {
        highscore.push([doc.data()['name'], doc.data()['score'], doc.data()['time'], doc.data()['mode']])
      }
    })
  });
  gameState = "end"
}

function endGame() {
  background(152, 113, 153);

  // draw Game Over and Your Score
  textSize(32);
  var msg = 'Game Over';
  var msgScore = 'Your Score is ' + score;
  msgWidht = textWidth(msg);
  scoreWidht = textWidth(msgScore);
  fill(255);
  text(msg, (width - msgWidht) / 2, height / 2 - 150);
  text(msgScore, (width - scoreWidht) / 2, height / 2 - 100);

  // add ranking table
  var depth = 370
  fill(255);
  textSize(25)
  text("Name", 28, depth);
  text("Time", 270, depth);
  text("Score", 140, depth);

  textSize(18)
  text(highscore[0][0], 18, depth + 30);
  text(highscore[0][2], 220, depth + 30);
  text(highscore[0][1], 150, depth + 30);

  text(highscore[1][0], 18, depth + 60);
  text(highscore[1][2], 220, depth + 60);
  text(highscore[1][1], 150, depth + 60);

  text(highscore[2][0], 18, depth + 90);
  text(highscore[2][2], 220, depth + 90);
  text(highscore[2][1], 150, depth + 90);

  text(highscore[3][0], 18, depth + 120);
  text(highscore[3][2], 220, depth + 120);
  text(highscore[3][1], 150, depth + 120);

  text(highscore[4][0], 18, depth + 150);
  text(highscore[4][2], 220, depth + 150);
  text(highscore[4][1], 150, depth + 150);

  //Restart button
  startBtn = createButton('Try again');
  startBtn.position(width / 2 - startBtn.width / 2, height / 2 - 60);
  shots = []
  startBtn.mousePressed(helloworld);
  noLoop();
}


function draw() {
  //State machine
  if (highscore.length == 0) {
    return
  }
  if (gameState == 'init') {
    initGame();
  } else if (gameState == 'play') {
    runGame();
  } else if (gameState == 'update') {
    updateGame();
  } else if (gameState == 'end') {
    endGame();
  }
}

function setJelloShots(num, shot_type) {
  // add more shots
  var cols = floor(width / pixel_size);
  var rows = floor(400 / pixel_size);
  for (var i = 0; i < num; i++) {
    var location = createVector(floor(random(cols)), floor(random(rows))).mult(pixel_size);
    while (snake_intersect(location)) {
      location = createVector(floor(random(cols)), floor(random(rows))).mult(pixel_size);
    }
    shots.push([location, shot_type]);
  }
}

function snake_intersect(location) {
  // check if new shot is lying on the snake
  var intersect = false;
  if (location.x == snake.pos.x && location.y == snake.pos.y) {
    intersect = true;
  } else {
    for (var i = 0; i < snake.tail.length; i++) {
      if (location.x == snake.tail[i].x && location.y == snake.tail[i].y) {
        intersect = true;
        break;
      }
    }
    for (var i = 0; i < shots.length; i++) {
      if (location.x == shots[i][0].x && location.y == shots[i][0].y) {
        intersect = true;
        break;
      }
    }
  }
  return intersect;
}

function mousePressed() {
  // select game mode
  if (gameState == "init") {
    if (mouseX < image_loc[0][0] + image_size && mouseX > image_loc[0][0] &&
      mouseY < image_loc[0][1] + image_size && mouseY > image_loc[0][1]) {
      frame = 10
      mode = "noob"
      frameRate(frame)
      helloworld()
    } else if (mouseX < image_loc[1][0] + image_size && mouseX > image_loc[1][0] &&
      mouseY < image_loc[1][1] + image_size && mouseY > image_loc[1][1]) {
      frame = 20
      mode = "pro"
      frameRate(frame)
      helloworld()
    } else if (mouseX < image_loc[2][0] + image_size && mouseX > image_loc[2][0] &&
      mouseY < image_loc[2][1] + image_size && mouseY > image_loc[2][1]) {
      frame = 40
      mode = "crazy"
      frameRate(frame)
      helloworld()
    }
  }
  else {
    // arrow control
    if (mouseX < button_arrow[0][0] + diameter / 2 && mouseX > button_arrow[0][0] - diameter / 2 &&
      mouseY < button_arrow[0][1] + diameter / 2 && mouseY > button_arrow[0][1] - diameter / 2) {
      movement.push([0, -1]);
    } else if (mouseX < button_arrow[1][0] + diameter / 2 && mouseX > button_arrow[1][0] - diameter / 2 &&
      mouseY < button_arrow[1][1] + diameter / 2 && mouseY > button_arrow[1][1] - diameter / 2) {
      movement.push([1, 0]);
    } else if (mouseX < button_arrow[2][0] + diameter / 2 && mouseX > button_arrow[2][0] - diameter / 2 &&
      mouseY < button_arrow[2][1] + diameter / 2 && mouseY > button_arrow[2][1] - diameter / 2) {
      movement.push([0, 1]);
    } else if (mouseX < button_arrow[3][0] + diameter / 2 && mouseX > button_arrow[3][0] - diameter / 2 &&
      mouseY < button_arrow[3][1] + diameter / 2 && mouseY > button_arrow[3][1] - diameter / 2) {
      movement.push([-1, 0]);
    }
  }
}

function touchStarted() {
  // select game mode
  if (gameState == "init") {
    if (touches[0].x < image_loc[0][0] + image_size && touches[0].x > image_loc[0][0] &&
      touches[0].y < image_loc[0][1] + image_size && touches[0].y > image_loc[0][1]) {
      frame = 10
      mode = "noob"
      frameRate(frame)
      helloworld()
    } else if (touches[0].x < image_loc[1][0] + image_size && touches[0].x > image_loc[1][0] &&
      touches[0].y < image_loc[1][1] + image_size && touches[0].y > image_loc[1][1]) {
      frame = 20
      mode = "pro"
      frameRate(frame)
      helloworld()
    } else if (touches[0].x < image_loc[2][0] + image_size && touches[0].x > image_loc[2][0] &&
      touches[0].y < image_loc[2][1] + image_size && touches[0].y > image_loc[2][1]) {
      frame = 40
      mode = "crazy"
      frameRate(frame)
      helloworld()
    }
  }
  else {
    // arrow control
    if (touches[0].x < button_arrow[0][0] + diameter / 2 && touches[0].x > button_arrow[0][0] - diameter / 2 &&
      touches[0].y < button_arrow[0][1] + diameter / 2 && touches[0].y > button_arrow[0][1] - diameter / 2) {
      movement.push([0, -1]);
    } else if (touches[0].x < button_arrow[1][0] + diameter / 2 && touches[0].x > button_arrow[1][0] - diameter / 2 &&
      touches[0].y < button_arrow[1][1] + diameter / 2 && touches[0].y > button_arrow[1][1] - diameter / 2) {
      movement.push([1, 0]);
    } else if (touches[0].x < button_arrow[2][0] + diameter / 2 && touches[0].x > button_arrow[2][0] - diameter / 2 &&
      touches[0].y < button_arrow[2][1] + diameter / 2 && touches[0].y > button_arrow[2][1] - diameter / 2) {
      movement.push([0, 1]);
    } else if (touches[0].x < button_arrow[3][0] + diameter / 2 && touches[0].x > button_arrow[3][0] - diameter / 2 &&
      touches[0].y < button_arrow[3][1] + diameter / 2 && touches[0].y > button_arrow[3][1] - diameter / 2) {
      movement.push([-1, 0]);
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    movement.push([0, 1]);
  } else if (keyCode === UP_ARROW) {
    movement.push([0, -1]);
  } else if (keyCode === LEFT_ARROW) {
    movement.push([-1, 0]);
  } else if (keyCode === RIGHT_ARROW) {
    movement.push([1, 0]);
  }
}