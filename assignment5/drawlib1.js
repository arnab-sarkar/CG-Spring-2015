
   function Vector3(x, y, z) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.set(x, y, z);
   }
   Vector3.prototype = {
      set : function(x, y, z) {
         if (x !== undefined) this.x = x;
         if (y !== undefined) this.y = y;
         if (z !== undefined) this.z = z;
      },
   }

   var startTime = (new Date()).getTime() / 1000, time = startTime;
   var canvases = [];
   function initCanvas(id) {
      var canvas = document.getElementById(id);
      canvas.setCursor = function(x, y, z) {
         var r = this.getBoundingClientRect();
	 this.cursor.set(x - r.left, y - r.top, z);
      }
      canvas.cursor = new Vector3(0, 0, 0);
      canvas.onmousedown = function(e) { this.setCursor(e.clientX, e.clientY, 1); }
      canvas.onmousemove = function(e) { this.setCursor(e.clientX, e.clientY   ); }
      canvas.onmouseup   = function(e) { this.setCursor(e.clientX, e.clientY, 0); }
      canvases.push(canvas);
      return canvas;
   }
   function tick() {
      time = (new Date()).getTime() / 1000 - startTime;
      for (var i = 0 ; i < canvases.length ; i++)
         if (canvases[i].update !== undefined) {
	    var canvas = canvases[i];
            var g = canvas.getContext('2d');
            g.clearRect(0, 0, canvas.width, canvas.height);
            canvas.update(g);
         }
      setTimeout(tick, 1000 / 60);
   }
   tick();

   Vector3.prototype.pointToPixel = function() {
      this.x = canvas.width/2 + this.x * canvas.width/2;
      this.y = canvas.height/2 - this.y * canvas.width/2;
   }

   function identity()
   {
      var result = [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
      return result;
   }

   function rotateX(Theta)
   {
      var result = [[1,0,0,0],[0, Math.cos(Theta), -Math.sin(Theta),0],[0, Math.sin(Theta), Math.cos(Theta),0], [0,0,0,1]];
      return result;
   }

   function rotateY(Theta)
   {
      var result = [[Math.cos(Theta), 0, Math.sin(Theta),0],[0,1,0,0],[-Math.sin(Theta),0, Math.cos(Theta),0], [0,0,0,1]];
      return result;
   }

   function rotateZ(Theta)
   {
      var result = [[Math.cos(Theta), -Math.sin(Theta),0,0], [Math.sin(Theta), Math. cos(Theta), 0, 0],[0,0,1,0],[0,0,0,1]];
      return result;
   }

   function scale(x,y,z)
   {
      var result = [[x,0,0,0],[0,y,0,0],[0,0,z,0],[0,0,0,1]];
      return result;
   }

   function translate(x,y,z)
   {
      var result = [[1,0,0,x],[0,1,0,y],[0,0,1,z],[0,0,0,1]];
      return result;
   }

   Vector3.prototype.applyTransformation = function(t) {
      var result = [];
      for(var i = 0;i<3 ; i++)
      {
         result[i] = [];
      }
      result[0] = t[0][0]*this.x + t[0][1]*this.y + t[0][2]*this.z + t[0][3];
      result[1] = t[1][0]*this.x + t[1][1]*this.y + t[1][2]*this.z + t[1][3];
      result[2] = t[2][0]*this.x + t[2][1]*this.y + t[2][2]*this.z + t[2][3];
      this.x = result[0];
      this.y = result[1];
      this.z = result[2];
   }

   function getSquare() {
      var squareVertices = [new Vector3(-.1,-.1,0), new Vector3(.1,-.1,0), new Vector3(-.1,.1,0), new Vector3(.1,.1,0)];
      return squareVertices;
   }

   function getCircle() {
      var circle = new Vector3(0,0,0);
      return circle;
   }
