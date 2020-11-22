var snake;
var pixel_size = 20;
var foods = [];
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
var img_slow, img_med, img_fast, img_bg_init, img_bg_run_top, img_bg_run_bottom, img_bg_end, img_tryagain
var font_noteworthy
var image_loc = [[40, 300], [150, 300], [260, 300]]
var image_size = 64
let highscore = []
let sound_init
var frame = 10
var color_code = {}

function preload() {
  // First perform the query
  firebase.firestore().collection('Records').where('name', '==', "Anonymous").get()
    .then(function (querySnapshot) {
      // Once we get the results, begin a batch
      var batch = firebase.firestore().batch();

      querySnapshot.forEach(function (doc) {
        // For each doc, add a delete operation to the batch
        batch.delete(doc.ref);
      });

      // Commit the batch
      return batch.commit();
    }).then(function () {
      print("Deleted anonymoys records")
    });
  // get data from firestore
  firebase.firestore().collection("Records").orderBy("score", "desc").limit(5)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, " => ", doc.data());
        highscore.push([doc.data()['name'], doc.data()['score'], doc.data()['time'], doc.data()['mode']])
      });
    })

  img_slow = loadImage("imgs/calm.png")
  img_med = loadImage("imgs/windy.png")
  img_fast = loadImage("imgs/storm.png")
  img_bg_init = loadImage("imgs/bg_init.png")
  img_bg_run_top = loadImage("imgs/bg_run_top.png")
  img_bg_run_bottom = loadImage("imgs/bg_run_bottom.jpg")
  img_bg_end = loadImage("imgs/bg_end.png")
  img_tryagain = loadImage("imgs/tryagain.png")
  font_noteworthy = loadFont("fonts/Noteworthy.ttf")
  sound_init = loadSound("sounds/jazz.mp3")
  sound_water = loadSound("sounds/water.mp3")
}

function setup() {
  createCanvas(400, 600);
  frameRate(10);
  color_code = {
    'food_red': color(166, 47, 38),
    'food_yellow': color(235, 196, 59),
    'food_green': color(127, 167, 173),
    'food_stroke': color(143, 111, 11)
  }
}

function initGame() {
  sound_init.loop()
  // background color
  image(img_bg_init, 0, 0);

  //draw SNAKE GAME
  stroke(170, 56, 71);
  strokeWeight(4)
  textSize(70);
  textFont(font_noteworthy);
  fill(198, 185, 199)
  text("Snake Game", 30, 130);

  // draw snake icon
  stroke(56, 45, 59)
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
  stroke(color_code['food_stroke'])
  fill(color_code['food_red']);
  rect(50, 450, 20, 20);
  fill(color_code['food_yellow']);
  rect(50, 490, 20, 20);
  fill(color_code['food_green']);
  rect(50, 530, 20, 20);
  noStroke()
  fill(232, 190, 186)

  textSize(18)
  text("+ 10 points", 100, 467);
  text("+ 3  points", 100, 507);
  text("+  1   point", 100, 547);
  textSize(18)
  fill(224, 181, 70)
  text("Limited time", 260, 470);
  textSize(40)
  fill(224, 70, 70)
  text("60s", 260, 520);

  // draw input name box + highscore
  nameWidht = textWidth(name);
  textSize(20)
  fill(80, 59, 82);
  text("Your name :", 50, 250);
  if (name == "") {
    input = createInput("").attribute('maxlength', 10);
  }
  else {
    input = createInput(name).attribute('maxlength', 10);
  }
  input.position(150, 230);
  text("Top player :  " + highscore[0][0] + "  -  Score: " + highscore[0][1], 50, 280);

  // draw mode selection
  textSize(13)

  var level = "C A L M"
  image(img_slow, image_loc[0][0], image_loc[0][1]);
  stroke(163, 46, 13);
  strokeWeight(4)
  fill(255, 241, 237)
  // textFont('Avenir');
  text(level, image_loc[0][0] + image_size / 2, image_loc[0][1] + 50);

  level = "W I N D Y"
  image(img_med, image_loc[1][0], image_loc[1][1]);
  text(level, image_loc[1][0] + image_size / 2, image_loc[1][1] + 50);

  level = "S T O R M"
  image(img_fast, image_loc[2][0] - 3, image_loc[2][1]);

  text(level, image_loc[2][0] + image_size / 2 - 10, image_loc[2][1] + 50);

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
  setFood(3, "green");
  setFood(1, "red");
  setFood(2, "yellow");
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
  sound_init.stop()
  if (!sound_water.isPlaying())
    sound_water.play()
  // print(mouseX, mouseY)
  noStroke()

  image(img_bg_run_top, 1, 0);

  // update Snake
  snake.update();
  snake.show();
  snake.checkDeath();

  // draw control box
  image(img_bg_run_bottom, 0, 399);
  arrow(button_arrow[0][0], button_arrow[0][1], diameter, 0)
  arrow(button_arrow[1][0], button_arrow[1][1], diameter, 90)
  arrow(button_arrow[2][0], button_arrow[2][1], diameter, 180)
  arrow(button_arrow[3][0], button_arrow[3][1], diameter, 270)

  // draw updated score
  textSize(18);
  fill(198, 185, 199)

  if (name == "") {
    name = "Anonymous"
  }
  text("Name: " + name, 20, 510);
  text("Score: " + score, 20, 540);
  text("Top: " + highscore[0][0] + " " + highscore[0][1], 20, 570);
  noStroke()

  // draw Timer
  fill(200, 38, 38);
  stroke(189, 180, 134);
  strokeWeight(2)
  textSize(50);
  text(timer, 30, 470);
  if (frameCount % frame == 0 && timer > 0) {
    timer--;
  }

  // add more foods at specific times
  if (frameCount % (frame * 30) == 0 || frameCount % (frame * 40) == 0 ||
    frameCount % (frame * 50) == 0 || frameCount % (frame * 55) == 0) {
    setFood(3, "green");
    setFood(1, "red");
    setFood(2, "yellow");
  }

  // draw foods
  for (var i = 0; i < foods.length; i++) {
    stroke(color_code['food_stroke'])
    if (foods[i][1] == "red") {
      fill(color_code['food_red'])
    } else if (foods[i][1] == "yellow") {
      fill(color_code['food_yellow'])
    } else if (foods[i][1] == "green") {
      fill(color_code['food_green'])
    }
    rect(foods[i][0].x, foods[i][0].y, pixel_size, pixel_size);

    // draw again the eaten foods
    if (snake.eat(foods[i])) {
      snake.tail.push(createVector(foods[i][0].x, foods[i][0].y));
      var eaten = foods.splice(i, 1);
      // update score when snake eat the foods
      if (eaten[0][1] == "red") {
        setFood(1, "red");
        score += 10
      } else if (eaten[0][1] == "yellow") {
        setFood(1, "yellow");
        score += 3
      } else if (eaten[0][1] == "green") {
        setFood(1, "green");
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
      highscore.push([doc.data()['name'], doc.data()['score'], doc.data()['time'], doc.data()['mode']])
    })
  });
  gameState = "end"
}

function endGame() {
  image(img_bg_end, 0, 0);

  // draw Game Over and Your Score
  textSize(65);
  var msg = 'Game Over';
  var msgScore = 'Your Score is ' + score;
  msgWidht = textWidth(msg);
  scoreWidht = textWidth(msgScore);

  stroke(170, 56, 71);
  strokeWeight(4)
  fill(198, 185, 199)
  text(msg, (width - msgWidht) / 2, height / 2 - 120);
  textSize(28);
  text(msgScore, (width - scoreWidht) / 2 + 110, height / 2 - 70);
  noStroke()

  // add ranking table
  var depth = 350
  fill(244, 242, 227);
  textSize(22)
  stroke(170, 56, 71);
  strokeWeight(2)
  fill(198, 185, 199)
  text("Name", 100, depth);
  text("Score", 250, depth);
  textSize(18)
  fill(245, 225, 223);
  noStroke()
  for (var i = 0; i < 5; i++) {
    text(highscore[i][0], 100, depth + 30 * (i + 1));
    text(highscore[i][1], 270, depth + 30 * (i + 1));
  }

  //Restart button
  foods = []
  //try again
  image(img_tryagain, width / 2 - 75, height / 2 - 60)
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

function setFood(num, shot_type) {
  // add more foods
  var cols = floor(width / pixel_size);
  var rows = floor(400 / pixel_size);
  for (var i = 0; i < num; i++) {
    var location = createVector(floor(random(cols)), floor(random(rows))).mult(pixel_size);
    while (snake_intersect(location)) {
      location = createVector(floor(random(cols)), floor(random(rows))).mult(pixel_size);
    }
    foods.push([location, shot_type]);
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
    for (var i = 0; i < foods.length; i++) {
      if (location.x == foods[i][0].x && location.y == foods[i][0].y) {
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
  else if (gameState == "end") {
    //width / 2 - 75, height / 2 - 60
    if (mouseX < width / 2 - 75 + 150 && mouseX > width / 2 - 75 &&
      mouseY < height / 2 - 60 + 100 && mouseY > height / 2 - 60) {
      gameState = "init"
      initGame()
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
  else if (gameState == "end") {
    //width / 2 - 75, height / 2 - 60
    if (touches[0].x < width / 2 - 75 + 150 && touches[0].x > width / 2 - 75 &&
      touches[0].y < height / 2 - 60 + 100 && touches[0].y > height / 2 - 60) {
      gameState = "init"
      initGame()
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
