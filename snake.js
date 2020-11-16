function Snake(){
    this.show = function(){
      fill(232, 179, 211);
      noStroke()
      //draw the snake tail
      for(var i=0;i<this.tail.length;i++){
        rect(this.tail[i].x, this.tail[i].y, pixel_size, pixel_size);
      }
  
      //draw the snake head
      rect(this.pos.x, this.pos.y, pixel_size, pixel_size)
    }
  
    this.update = function(){
      //move snake's position into tail and pop off the end
      if(movement.length){
        if(snake.speed.x != movement[0][0]*-1 && snake.speed.y != movement[0][1]*-1){
          snake.dir(movement[0][0], movement[0][1]);
        }
        movement.splice(0, 1);
      }
  
      this.tail.unshift(createVector(this.pos.x, this.pos.y));
      this.tail.pop();
      //move the snake
      if(this.pos.x >= width) {
        this.pos.x = 0;
        this.pos.y += this.speed.y * pixel_size;
      }
      else if(this.pos.x < 0) {
        this.pos.x = width-pixel_size; 
        this.pos.y += this.speed.y * pixel_size;
      }
      else if(this.pos.y >= 400) {
        this.pos.y = 0;
        this.pos.x += this.speed.x * pixel_size;
      }
      else if(this.pos.y <0) {
        this.pos.y = 400-pixel_size;
        this.pos.x += this.speed.x * pixel_size;
      }
      else{
        this.pos.x += this.speed.x * pixel_size;
        this.pos.y += this.speed.y * pixel_size;
      }
    }
    this.dir = function(x, y){
      this.speed.x = x;
      this.speed.y = y;
    }
  
   this.checkDeath = function(){
      // if(this.pos.x >= width || this.pos.y >= 400 || this.pos.x < 0 || this.pos.y < 0){
      //   gameState = 'end';
      // }
      for(var i=0;i<this.tail.length;i++){
        if(this.tail[i].x == this.pos.x && this.tail[i].y == this.pos.y){
          gameState = 'end';
        }
      }
     if( timer==0){
       gameState = 'end'
     }
    }
  
  
    this.eat = function(pos){
      return this.pos.x == pos[0].x && this.pos.y == pos[0].y;
    }
  
    this.reset = function(){
      shots = [];
      this.tail = [];
      this.pos = createVector(0, 0);
      this.speed = createVector(1, 0);
    }
  
    this.reset();
  }