var snake;
var pixel_size = 20;
var shots = [];
var movement = [];
var highscore = 0;
var score = 0;
var gameState = 'init';
var records;
var timer = 60
var button_arrow = [[300,450],[350,500],[300,550],[250,500]]
var diameter = 50
var name = "Boss"

function preload(){
  records = loadTable('Records.csv', 'csv', 'header');  
}

function setup(){
  createCanvas(400,600);
  frameRate(10);
}

function initGame(){
  removeElements();
  background(152, 113, 153);
  fill(139, 214, 189,150)
  rect(0,400,400,200)
  fill(166, 47, 38)
  rect(50, 270, 20, 20)
  fill(235, 196, 59)
  rect(50, 300, 20, 20)
  fill(66, 61, 122)
  rect(50, 330, 20, 20)
  textSize(50);
  fill(139, 214, 189);
  nameWidht = textWidth(name);
  text("SNAKE GAME", (width - nameWidht)/2-160, 400/2 -60);
  textSize(20)
  fill(139, 214, 189);
  text("Your name", (width - nameWidht)/2-140, 400/2 + 50);
  text("+10 score", (width - nameWidht)/2-120, 400/2 + 90);
  text("+3   score", (width - nameWidht)/2-120, 400/2 + 120);
  text("+1   score", (width - nameWidht)/2-120, 400/2 + 150);
  
  startBtn = createButton('Start here');
  startBtn.position(width/2 - startBtn.width/2, 400/2-10);
  startBtn.mousePressed(bobHi);
  noLoop();
}

function bobHi(){
  removeElements();
  timer=60
  highscore = 0;
  score = 0
  gameState = 'play';
  snake = new Snake();
  setJelloShots(3,"green");
  setJelloShots(1,"red");
  setJelloShots(2,"yellow");
  loop();
}

  
function rotatePoint(point,degree, center){ 
  degree = radians(degree); 
  var x = point[0]
  var y = point[1]
  point[0] = x*cos(degree)-y*sin(degree)+center[0]; 
  point[1] = x*sin(degree)+y*cos(degree)+center[1]; 
  return point
} 

function arrow(x,y,r,a){
  noStroke()
  fill(71, 89, 97)
  circle(x,y,r)
  fill(217, 163, 199)
  var t1 = rotatePoint([0, -r/3],a,[x,y])
  var t2 = rotatePoint([-r/4,-r/5],a,[x,y])
  var t3 = rotatePoint([r/4,-r/5],a,[x,y])
  var w = r/4.7
  var h = r/2.5
  var q1 = rotatePoint([-r/9,-r/5],a,[x,y])
  var q2 = rotatePoint([-r/9+w,-r/5],a,[x,y])
  var q3 = rotatePoint([-r/9+w,-r/5+h],a,[x,y])
  var q4 = rotatePoint([-r/9,-r/5+h],a,[x,y])
  triangle(t1[0],t1[1],t2[0],t2[1],t3[0],t3[1]);
  quad(q1[0],q1[1],q2[0],q2[1],q3[0],q3[1],q4[0],q4[1])
}

function runGame(){
  background(152, 113, 153);
  fill(139, 214, 189,150)
  rect(0,400,400,200)
  
  arrow(button_arrow[0][0],button_arrow[0][1],diameter,0)
  arrow(button_arrow[1][0],button_arrow[1][1],diameter,90)
  arrow(button_arrow[2][0],button_arrow[2][1],diameter,180)
  arrow(button_arrow[3][0],button_arrow[3][1],diameter,270)
  
  fill(163, 38, 38);
  textSize(30);
  text(timer, width-width/1.3, height-height/7);
  
  
  if (frameCount % 10 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    timer --;
  }
  
  
  textSize(15);
  fill(255);
  text("score: " + score, 37, 420);
  text("highscore: " + highscore,50, 450);

  //print(snake.pos.x, snake.pos.y)
  
  snake.update();
  snake.show();
  snake.checkDeath();

  for(var i=0;i<shots.length;i++){
    stroke(0,0,0)
    if (shots[i][1] == "red"){
      fill(166, 47, 38)
    }
    else if (shots[i][1] == "yellow"){
      fill(235, 196, 59)
    }
    else if (shots[i][1] == "green"){
      fill(66, 61, 122)
    }
    rect(shots[i][0].x, shots[i][0].y, pixel_size, pixel_size);
    if(snake.eat(shots[i])){
      snake.tail.push(createVector(shots[i][0].x, shots[i][0].y));
      var eaten = shots.splice(i, 1);
      if (eaten[0][1] == "red"){
        setJelloShots(1,"red");
        score += 10
      }
      else if (eaten[0][1] == "yellow"){
        setJelloShots(1,"yellow");
        score += 3
      }
      else if (eaten[0][1] == "green"){
        setJelloShots(1,"green");
        score += 1
      }
      if(score > highscore) highscore = score;
    }
  }
}

function endGame(){
  let newRow = records.addRow();
  newRow.setString('Name', name);
  newRow.setString('Score', score);
  newRow.setString('Time', month()+"/"+day()+" "+hour()+":"+minute()+":"+second());
  saveTable(records, './Records.csv', 'csv'); 
  
  background(152, 113, 153);
  textSize(32);
  var msg = 'Game Over';
  var msgScore = 'Your Score is ' + score;
  msgWidht = textWidth(msg);
  scoreWidht = textWidth(msgScore);
  fill(255);
  text(msg, (width - msgWidht)/2, height/2 - 40);
  text(msgScore, (width - scoreWidht)/2, height/2);
  startBtn = createButton('Restart Game');
  startBtn.position(width/2 - startBtn.width/2, height/2 + 40);
  startBtn.mousePressed(bobHi);
  noLoop();
}


function draw(){
  if(gameState == 'init'){
    initGame();
  }
  else if(gameState == 'play'){
    runGame();
  }
  else if(gameState == 'end'){
    endGame();
  }  
}

function setJelloShots(num, shot_type){
  var cols = floor(width / pixel_size);
  var rows = floor(400 / pixel_size);
  for(var i=0;i<num;i++){
    var location = createVector(floor(random(cols)), floor(random(rows))).mult(pixel_size);
    while(snake_intersect(location)){
      location = createVector(floor(random(cols)), floor(random(rows))).mult(pixel_size);
    }
    shots.push([location,shot_type]);
  }
}

function snake_intersect(location){
  var intersect = false;
  if(location.x == snake.pos.x && location.y == snake.pos.y){
    intersect = true;
  }else{
    for(var i=0;i<snake.tail.length;i++){
      if(location.x == snake.tail[i].x && location.y == snake.tail[i].y){
        intersect = true;
        break;
      }
    }
    for(var i=0;i<shots.length;i++){
      if(location.x == shots[i][0].x && location.y == shots[i][0].y){
        intersect = true;
        break;
      }
    }
  }
  return intersect;
}

function mousePressed() {
  if(mouseX < button_arrow[0][0] + diameter/2 && mouseX > button_arrow[0][0] - diameter/2 && 
     mouseY < button_arrow[0][1] + diameter/2 && mouseY > button_arrow[0][1] - diameter/2){
    movement.push([0, -1]);
  }else if(mouseX < button_arrow[1][0] + diameter/2 && mouseX > button_arrow[1][0] - diameter/2 && 
           mouseY < button_arrow[1][1] + diameter/2 && mouseY > button_arrow[1][1] - diameter/2){
    movement.push([1, 0]);
  }else if(mouseX < button_arrow[2][0] + diameter/2 && mouseX > button_arrow[2][0] - diameter/2 && 
           mouseY < button_arrow[2][1] + diameter/2 && mouseY > button_arrow[2][1] - diameter/2){
    movement.push([0, 1]);
  }else if(mouseX < button_arrow[3][0] + diameter/2 && mouseX > button_arrow[3][0] - diameter/2 && 
           mouseY < button_arrow[3][1] + diameter/2 && mouseY > button_arrow[3][1] - diameter/2){
    movement.push([-1, 0]);
  }
}

function touchStarted() {
  if(touches[0].x < button_arrow[0][0] + diameter/2 && touches[0].x > button_arrow[0][0] - diameter/2 && 
     touches[0].y < button_arrow[0][1] + diameter/2 && touches[0].y > button_arrow[0][1] - diameter/2){
    movement.push([0, -1]);
  }else if(touches[0].x < button_arrow[1][0] + diameter/2 && touches[0].x > button_arrow[1][0] - diameter/2 && 
           touches[0].y < button_arrow[1][1] + diameter/2 && touches[0].y > button_arrow[1][1] - diameter/2){
    movement.push([1, 0]);
  }else if(touches[0].x < button_arrow[2][0] + diameter/2 && touches[0].x > button_arrow[2][0] - diameter/2 && 
           touches[0].y < button_arrow[2][1] + diameter/2 && touches[0].y > button_arrow[2][1] - diameter/2){
    movement.push([0, 1]);
  }else if(touches[0].x < button_arrow[3][0] + diameter/2 && touches[0].x > button_arrow[3][0] - diameter/2 && 
           touches[0].y < button_arrow[3][1] + diameter/2 && touches[0].y > button_arrow[3][1] - diameter/2){
    movement.push([-1, 0]);
  }
}

function keyPressed(){
  if(keyCode === DOWN_ARROW){
    movement.push([0, 1]);
  }else if(keyCode === UP_ARROW){
    movement.push([0, -1]);
  }else if(keyCode === LEFT_ARROW){
    movement.push([-1, 0]);
  }else if(keyCode === RIGHT_ARROW){
    movement.push([1, 0]);
  }
}

