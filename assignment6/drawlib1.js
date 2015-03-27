
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

   Vector3.prototype.translate = function(x,y,z) {
      var t = translate(x,y,z);
      this.applyTransformation(t);
   }

   Vector3.prototype.rotateZ = function(t) {
      var r = rotateZ(t);
      this.applyTransformation(r);
   }

   Vector3.prototype.transform = function(m1, m2) {
      var r = transform(m1, m2);
      this.applyTransformation(r);
   }

   Vector3.prototype.scale = function(x,y,z) {
      var s = scale(x,y,z);
      this.applyTransformation(s);
   }

   function transform(m1,m2)
   {
      return [ m2[0] * m1[0] + m2[4] * m1[1] + m2[8] * m1[2] + m2[12],
               m2[1] * m1[0] + m2[5] * m1[1] + m2[9] * m1[2] + m2[13],
               m2[2] * m1[0] + m2[6] * m1[1] + m2[10] * m1[2] + m2[14]];
   }

   function getSquare() {
      var squareVertices = [new Vector3(-.1,-.1,-.2), new Vector3(.1,-.1,-.2), new Vector3(-.1,.1,-.2), new Vector3(.1,.1,-.2)];
      return squareVertices;
   }

   function getCircle() {
      var circle = new Vector3(0,0,0);
      return circle;
   }

   function getTriangle() {
      var triangle = [new Vector3(0,1/Math.cbrt(3),0), new Vector3(0.5,-1/(2*Math.cbrt(3)),0), new Vector3(-0.5,-1/(2*Math.cbrt(3)),0)];
      return triangle;
   }

   function getCube() {
      var cubeVertices = [new Vector3(-.1,-.1,0), new Vector3(.1,-.1,0), new Vector3(-.1,.1,0), new Vector3(.1,.1,0),
                           new Vector3(-.1,-.1,-.1), new Vector3(.1,-.1,-.1), new Vector3(-.1,.1,-.1), new Vector3(.1,.1,-.1)];
      return cubeVertices;
   }

   function perspective(f)
   {
      var result = [ [1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, f, 1]
                  ];
      return result;
   }

    Vector3.prototype.perspective = function(other) {
      var point = [this.x,this.y,this.z,1]; 
      var result = [0,0,0,0];
      for (var row = 0 ; row < 4 ; row++){
         for (var col = 0 ; col < 4 ; col++)
         {
            result[row] += (other[row][col] * point[col]);
         }
         console.log(result[row]);
      }
      this.x= result[0]/result[3];
      this.y = result[1]/result[3];
      this.z = result[2]/result[3];
   }

   function convertUVtoXY(u,v,c){
      var TAU = 2 * Math.PI;
      var PI = Math.PI;
      var theta = TAU * u;
      var phi = PI * v - PI / 2;      
      var x = Math.cos(phi) * Math.sin(theta);
      var y = Math.sin(phi);
      var z = Math.cos(phi) * Math.cos(theta);  
      if(c) {
         var t = Math.pow(Math.pow(x,8) + Math.pow(y,8) + Math.pow(z,8),1/8);
         x /= t;
         y /= t;
         z /= t;
      }  
      return new Vector3(x,y,z);
   }

   function nautilus(u,v){
      var TAU = 2 * Math.PI;
      var PI = Math.PI;
      var theta = PI * u * 3;
      var phi = 2 * (PI * v - PI / 2);      
      var x = theta * Math.cos(theta) * (Math.cos(phi) + 1);
      var y = theta * Math.sin(theta) * (Math.cos(phi) + 1);
      var z = theta * Math.sin(phi);  
      return new Vector3(x,y,z);
   }

   function dini(u,v){
      var TAU = 2 * Math.PI;
      var PI = Math.PI;
      var theta = PI * u * 4;
      var phi = 1 + Math.sin(PI * v);      
      var x = Math.cos(theta) * Math.sin(phi);
      var y = Math.sin(theta) * Math.sin(phi);
      var z = Math.cos(phi) + Math.log(Math.tan(phi/2)) + 0.2 * theta - 4;  
      return new Vector3(x,y,z);
   }

   function toroid(u,v){
      var TAU = 2 * Math.PI;
      var PI = Math.PI;
      var theta = PI * u * 3;
      var phi = 2 * (PI * v - PI / 2);      
      var x = Math.cos(theta)*(theta/(3*PI)*Math.cos(phi)+2);
      var y = Math.sin(theta)*(theta/(3*PI)*Math.cos(phi)+2);
      var z = theta * Math.sin(phi) / (3 * PI);  
      return new Vector3(x,y,z);
   }

   function Matrix () {
        this.M = [[1,0,0,0],
                  [0,1,0,0],
                  [0,0,1,0],
                  [0,0,0,1]]; 
   }
   Matrix.prototype = {     
     translate : function(x, y, z) {
         T = translate(x,y,z);
         this.M = this.applyTransformation(this.M,T);
         return;
     },
     rotateX : function(theta) { 
         R = rotateX(theta);
         this.M = this.applyTransformation(this.M,R);
         return;
     },
     rotateY : function(theta) {
         R = rotateY(theta);
         this.M = this.applyTransformation(this.M,R);
         return;
     },
     rotateZ : function(theta) {
         R = rotateZ(theta);
         this.M = this.applyTransformation(this.M,R);
         return;
     },
     scale : function(x, y, z) {
         S = scale(x,y,z);
         this.M = this.applyTransformation(this.M,S);
         return;
     },
      perspective : function(x, y, z) {
         P = perspective(x,y,z);
         this.M = this.applyTransformation(this.M,P);
         return;
     },
     transform : function(src) {
         srclst = [[src.x],[src.y],[src.z],[1]];
         dstlst = this.applyTransformation(this.M,srclst);
         dst = new Vector3(dstlst[0],dstlst[1],dstlst[2]);
       return dst;
     },
     identity : function() {
       this.M = identity();      
       return;
     },
     applyTransformation : function(m1, m2) {
         var result = [];
         for (var i = 0; i < m1.length; i++) {
            result[i] = [];
            for (var j = 0; j < m2[0].length; j++) {
                var sum = 0;
                for (var k = 0; k < m1[0].length; k++) {
                    sum += m1[i][k] * m2[k][j];
                }
                result[i][j] = sum;
            }
         }
         return result;
      },
   }
