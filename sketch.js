var snake;
var pixel_size = 20;
var shots = [];
var movement = [];
var score = 0;
var gameState = 'init';
var timer = 60
var button_arrow = [
  [300, 450],
  [350, 500],
  [300, 550],
  [250, 500]
]
var diameter = 50
var name = ""
var input
// var img;
let highscore = []
var song1
var frame = 40

function preload() {
  firebase.firestore().collection("Records").orderBy("score", "desc").limit(5)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, " => ", doc.data());
        highscore.push([doc.data()['name'], doc.data()['score'], doc.data()['time']])
      });
    })
  img = loadImage('snake.jpg');
}

function setup() {
  createCanvas(400, 600);
  frameRate(frame);
  gameState = "init"
}

function initGame() {
  background(152, 113, 153);
  // image(img, 0, 0, 100, 100);

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
  fill(255, 255)
  line(30, 50, 172, 169)
  fill(152, 113, 153);
  rect(0, 400, 400, 200);

  fill(139, 214, 189, 200);
  rect(20, 420, 360, 160);
  stroke(0, 0, 0)
  fill(150, 39, 69);
  rect(50, 450, 20, 20);
  fill(235, 196, 59);
  rect(50, 490, 20, 20);
  fill(66, 61, 122);
  rect(50, 530, 20, 20);
  textSize(55);
  fill(139, 214, 189);
  nameWidht = textWidth(name);
  fill(237, 209, 233)
  text("SNAKE GAME", (width - nameWidht) / 2 - 170, 400 / 2 - 60);
  textSize(20)
  fill(139, 214, 189);
  text("Your name:", (width - nameWidht) / 2 - 100, 400 / 2 + 50);
  input = createInput("").attribute('maxlength', 10);
  input.position(220, 248);

  text("Highscore : " + highscore[0][0] + " " + highscore[0][1], (width - nameWidht) / 2 - 100, 400 / 2 + 90);

  noStroke()
  fill(54, 52, 53)
  text("+10 score", (width - nameWidht) / 2 - 90, 400 / 2 + 265);
  text("+ 3  score", (width - nameWidht) / 2 - 90, 400 / 2 + 305);
  text("+ 1  score", (width - nameWidht) / 2 - 90, 400 / 2 + 345);
  textSize(15)
  fill(54, 52, 53)
  text("Limited time:", (width - nameWidht) / 2 + 80, 400 / 2 + 265);
  textSize(40)
  fill(255, 0, 0)
  text("60s", (width - nameWidht) / 2 + 90, 400 / 2 + 310);

  startBtn = createButton('Start here');
  startBtn.position(width / 2 - startBtn.width / 2, 400 / 2 + 120);
  startBtn.mousePressed(bobHi);

  noLoop();
}

function bobHi() {
  removeElements();
  name = input.value();
  timer = 60
  score = 0
  gameState = 'play';
  frameCount = 1
  snake = new Snake();
  setJelloShots(3, "green");
  setJelloShots(1, "red");
  setJelloShots(2, "yellow");
  loop();
}


function rotatePoint(point, degree, center) {
  degree = radians(degree);
  var x = point[0]
  var y = point[1]
  point[0] = x * cos(degree) - y * sin(degree) + center[0];
  point[1] = x * sin(degree) + y * cos(degree) + center[1];
  return point
}

function arrow(x, y, r, a) {
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
  background(152, 113, 153);
  noStroke()
  fill(152, 113, 153);
  rect(0, 400, 400, 200);

  fill(139, 214, 189, 200);
  rect(20, 420, 360, 160);

  arrow(button_arrow[0][0], button_arrow[0][1], diameter, 0)
  arrow(button_arrow[1][0], button_arrow[1][1], diameter, 90)
  arrow(button_arrow[2][0], button_arrow[2][1], diameter, 180)
  arrow(button_arrow[3][0], button_arrow[3][1], diameter, 270)

  fill(163, 38, 38);
  textSize(30);
  text(timer, width - width / 1.1, height - height / 7);

  if (frameCount % frame == 0 && timer > 0) {
    timer--;
  }

  textSize(15);
  fill(255);
  text("score: " + score, 20, 440);
  text("highscore: " + highscore[0][0] + " " + highscore[0][1], 20, 460);
  fill(255, 181, 251)
  text("Name: " + name, 20, 420);

  snake.update();
  snake.show();
  snake.checkDeath();

  if (frameCount % (frame * 30) == 0 || frameCount % (frame * 40) == 0 ||
    frameCount % (frame * 50) == 0 || frameCount % (frame * 55) == 0) {
    setJelloShots(3, "green");
    setJelloShots(1, "red");
    setJelloShots(2, "yellow");
  }

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
  var time = nf(year(), 4, 0) + "-" + nf(month(), 2, 0) + "-" + nf(day(), 2, 0) + " " + nf(hour(), 2, 0) + ":" + nf(minute(), 2, 0) + ":" + nf(second(), 2, 0)
  firebase.firestore().collection("Records").doc(time).set({
    name: name,
    score: score,
    time: time
  }).then(function () {
    console.log("New document successfully written!");
  })
  highscore = []
  firebase.firestore().collection("Records").orderBy("score", "desc").limit(5).get().then(function (querySnapshot) {
    querySnapshot.forEach(function (doc) {
      console.log(doc.id, " => ", doc.data());
      highscore.push([doc.data()['name'], doc.data()['score'], doc.data()['time']])
    })
  });
  gameState = "end"
}

function endGame() {
  background(152, 113, 153);
  textSize(32);
  var msg = 'Game Over';
  var msgScore = 'Your Score is ' + score;
  msgWidht = textWidth(msg);
  scoreWidht = textWidth(msgScore);
  fill(255);
  text(msg, (width - msgWidht) / 2, height / 2 - 40);
  text(msgScore, (width - scoreWidht) / 2, height / 2);

  // add ranking table
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);
  text(highscore[1][1], (width - msgWidht) / 2, height / 2 - 40);


  startBtn = createButton('Restart Game');
  startBtn.position(width / 2 - startBtn.width / 2, height / 2 + 40);
  shots = []
  startBtn.mousePressed(bobHi);
  noLoop();
}


function draw() {
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

function touchStarted() {
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