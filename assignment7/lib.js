
function Bezier() {
}

Bezier.prototype = {
  /**
   * getCoord2 has the better performance :)
   */
  getCoord1: function (t, points) {
    var pascalK = this.getPascal(points.length);
    var point = new Vector3();
    var minusT = 1 - t;

    for (var i = 0; i < points.length; i++) {
      point.x += pascalK[i] * points[i].x * Math.pow(minusT, points.length - i - 1) * Math.pow(t, i);
      point.y += pascalK[i] * points[i].y * Math.pow(minusT, points.length - i - 1) * Math.pow(t, i);
    }

    return point;
  },
  getCoord2: function (t, points) {
    if (points === undefined || points.length < 3) {
      return;
    }

    if (points.length > 3) {
      var newPoints = [];

      for (var i = 0; i < points.length - 1; i++) {
        newPoints[i] = new Vector3();
        newPoints[i].x = (1 - t) * points[i].x + t * points[i + 1].x;
        newPoints[i].y = (1 - t) * points[i].y + t * points[i + 1].y;
      }

      return this.getCoord2(t, newPoints);
    } else if (points.length === 3) {
      var S = new Vector3();
      var T = new Vector3();
      S.x = (1 - t) * points[0].x + t * points[1].x;
      S.y = (1 - t) * points[0].y + t * points[1].y;
      T.x = (1 - t) * points[1].x + t * points[2].x;
      T.y = (1 - t) * points[1].y + t * points[2].y;
      var point = new Vector3();
      point.x = (1 - t) * S.x + t * T.x;
      point.y = (1 - t) * S.y + t * T.y;
      return point;
    }
  },
  /**
   * @param k the level of the pascal,
   */
  getPascal: function(k) {
    var curr = [];

    for (var i = 0; i < k; i++) {
      var next = [];
      for (var j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          next.push(1);
        } else {
          next.push(curr[j - 1] + curr[j]);
        }
      }
      curr = next;
    }

    return curr;
  }
};

var moveShape = function (shape, dir, speed) {
  var move = new Vector3(dir.x * speed * shape.scale.x, dir.y * speed * shape.scale.y, 0);

  for (var index in shape.vertices) {
    shape.vertices[index].add(move);
  }
  shape.coord.add(move);
};

var drawShape = function (canvas, matrix, icosahedron, callback) {
  for (var edgeIndex in icosahedron.edges) {
    var edge = icosahedron.edges[edgeIndex];
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(icosahedron.vertices[edge[0]], vertex1);
    matrix.transform(icosahedron.vertices[edge[1]], vertex2);
    vertex1.viewportTransformation(canvas);
    vertex2.viewportTransformation(canvas);
    callback(vertex1, vertex2);
  }
};

var drawBoard = function (canvas, g) {
  g.strokeStyle = 'black';
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(canvas.width, 0);
  g.lineTo(canvas.width, canvas.height);
  g.lineTo(0, canvas.height);
  g.lineTo(0, 0);
  g.stroke();
};

var getMatrixAdjustmentObj = function () {
  return {
    scale: .16,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    x1: 0
  }
};

var slideUpdate = function (canvasName, matrixAdjustmentObj) {
  $('#' + canvasName + '-scale').slider().on('slide', function (ev) {
    matrixAdjustmentObj.scale = ev.value;
  });
  $('#' + canvasName + '-translateX').slider().on('slide', function (ev) {
    matrixAdjustmentObj.translateX = ev.value;
  });
  $('#' + canvasName + '-translateY').slider().on('slide', function (ev) {
    matrixAdjustmentObj.translateY = ev.value;
  });
  $('#' + canvasName + '-translateZ').slider().on('slide', function (ev) {
    matrixAdjustmentObj.translateZ = ev.value;
  });
  $('#' + canvasName + '-rotateX').slider().on('slide', function (ev) {
    matrixAdjustmentObj.rX = ev.value;
  });
  $('#' + canvasName + '-rotateY').slider().on('slide', function (ev) {
    matrixAdjustmentObj.rY = ev.value;
  });
  $('#' + canvasName + '-rotateZ').slider().on('slide', function (ev) {
    matrixAdjustmentObj.rZ = ev.value;
  });
  if ($('#' + canvasName + '-x1') !== undefined) {
    $('#' + canvasName + '-x1').slider().on('slide', function (ev) {
      matrixAdjustmentObj.x1 = ev.value;
    });
  }
};

var startTime = (new Date()).getTime() / 1000, time = startTime;
var canvases = [];

function initCanvas(id) {
  var canvas = document.getElementById(id);

  canvas.setCursor = function(x, y, z) {
    var r = this.getBoundingClientRect();
    this.cursor.set(x - r.left, y - r.top, z);
  };

  canvas.cursor = new Vector3(0, 0, 0);

  canvas.onmousedown = function (e) {
    this.setCursor(e.clientX, e.clientY, 1);
  };

  canvas.onmousemove = function (e) {
    this.setCursor(e.clientX, e.clientY);
  };

  canvas.onmouseup = function (e) {
    this.setCursor(e.clientX, e.clientY, 0);
  };

  canvases.push(canvas);
  return canvas;
}

function tick() {
  time = (new Date()).getTime() / 1000 - startTime;
  for (var i = 0; i < canvases.length; i++)
    if (canvases[i].update !== undefined) {
      var canvas = canvases[i];
      var g = canvas.getContext('2d');
      g.clearRect(0, 0, canvas.width, canvas.height);
      canvas.update(g);
    }
  setTimeout(tick, 1000 / 60);
}

tick();

function Hermite() {
  this.P0 = new Vector3();
  this.P1 = new Vector3();
  this.R0 = 0.0;
  this.R1 = 0.0;
  this.matrix = [];

  this.set();
}

Hermite.prototype = {
  set: function () {
    this.matrix = [
      [2, -2, 1, 1],
      [-3, 3, -2, -1],
      [0, 0, 1, 0],
      [1, 0, 0, 0]
    ];
  },
  setParam: function (P0, P1, R0, R1) {
    this.P0 = P0;
    this.P1 = P1;
    this.R0 = R0;
    this.R1 = R1;

  },
  getCoord: function (t) {
    if (this.P0 === undefined || this.P1 === undefined || this.R0 === undefined || this.R1 === undefined) {
      throw "Parameters are not defined...";
    }
    var point = new Vector3();

    for (var i = 0; i < 4; i++) {
      var tmp = Math.pow(t, 3) * this.matrix[0][i] + Math.pow(t, 2) * this.matrix[1][i] + Math.pow(t, 1) * this.matrix[2][i] + Math.pow(t, 0) * this.matrix[3][i];

      switch (i) {
        case 0:
          point.x += tmp * this.P0.x;
          point.y += tmp * this.P0.y;
          break;
        case 1:
          point.x += tmp * this.P1.x;
          point.y += tmp * this.P1.y;
          break;
        case 2:
          point.x += tmp * this.R0;
          point.y += tmp * this.R0;
          break;
        default :
          point.x += tmp * this.R1;
          point.y += tmp * this.R1;
      }
    }

    return point;
  }
};


function Matrix() {
  this.row = 4;
  this.col = 4;
  this.matrix = [];
  this.scaleEnv = new Vector3(1, 1, 1);
  this.identityMatrix = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];

  for (var i = 0; i < this.row; i++) {
    this.matrix[i] = [];
  }

  this.identity();
}

Matrix.prototype = {
  set: function (m) {
    // No checking
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        this.matrix[i][j] = m[i][j];
      }
    }
  },
  identity: function () {
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        this.matrix[i][j] = this.identityMatrix[i][j];
      }
    }
  },
  translate: function (x, y, z) {
    var T = this.cloneIdentity();
    if (x !== undefined) T.matrix[0][3] = x;
    if (y !== undefined) T.matrix[1][3] = y;
    if (z !== undefined) T.matrix[2][3] = z;
    this.multiply(this.clone(), T, this);
  },
  rotateX: function (theta) {
    if (theta !== undefined) {
      var T = this.cloneIdentity();
      T.matrix[1][1] = Math.cos(theta * Math.PI / 180.0);
      T.matrix[1][2] = -Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][1] = Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][2] = Math.cos(theta * Math.PI / 180.0);
      this.multiply(this.clone(), T, this);
    }
  },
  rotateY: function (theta) {
    if (theta !== undefined) {
      var T = this.cloneIdentity();
      T.matrix[0][0] = Math.cos(theta * Math.PI / 180.0);
      T.matrix[0][2] = Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][0] = -Math.sin(theta * Math.PI / 180.0);
      T.matrix[2][2] = Math.cos(theta * Math.PI / 180.0);
      this.multiply(this.clone(), T, this);
    }
  },
  rotateZ: function (theta) {
    if (theta !== undefined) {
      var T = this.cloneIdentity();
      T.matrix[0][0] = Math.cos(theta * Math.PI / 180.0);
      T.matrix[0][1] = -Math.sin(theta * Math.PI / 180.0);
      T.matrix[1][0] = Math.sin(theta * Math.PI / 180.0);
      T.matrix[1][1] = Math.cos(theta * Math.PI / 180.0);
      this.multiply(this.clone(), T, this);
    }
  },
  scale: function (x, y, z) {
    var T = this.cloneIdentity();
    if (x !== undefined) this.scaleEnv.x = x;
    if (y !== undefined) this.scaleEnv.y = y;
    if (z !== undefined) this.scaleEnv.z = z;
    if (this.scaleEnv.x !== undefined) T.matrix[0][0] *= this.scaleEnv.x;
    if (this.scaleEnv.y !== undefined) T.matrix[1][1] *= this.scaleEnv.y;
    if (this.scaleEnv.z !== undefined) T.matrix[2][2] *= this.scaleEnv.z;
    this.multiply(this.clone(), T, this);
  },
  transform: function (src, dst) {
    w = this.matrix[3][0] * src.x + this.matrix[3][1] * src.y + this.matrix[3][2] * src.z + this.matrix[3][3];
    dst.x = (this.matrix[0][0] * src.x + this.matrix[0][1] * src.y + this.matrix[0][2] * src.z + this.matrix[0][3]) / w;
    dst.y = (this.matrix[1][0] * src.x + this.matrix[1][1] * src.y + this.matrix[1][2] * src.z + this.matrix[1][3]) / w;
    dst.z = (this.matrix[2][0] * src.x + this.matrix[2][1] * src.y + this.matrix[2][2] * src.z + this.matrix[2][3]) / w;
  },
  perspective: function (x, y, z) {
    var T = this.cloneIdentity();
    if (x !== undefined) T.matrix[3][0] = x;
    if (y !== undefined) T.matrix[3][1] = y;
    if (z !== undefined) T.matrix[3][2] = z;
    this.multiply(this.clone(), T, this);
  },
  perspective2: function (f) {
    var T = this.cloneIdentity();
    if (f !== undefined) {
      T.matrix[3][2] = 1 / f;
      T.matrix[3][3] = 0;
    }
    this.multiply(this.clone(), T, this);
  },
  clone: function () {
    var clone = new Matrix();
    clone.set(this.matrix);
    return clone;
  },
  cloneIdentity: function () {
    var clone = new Matrix();
    clone.set(this.identityMatrix);
    return clone;
  },
  multiply: function (A, B, C) {
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
        var sum = 0;
        for (var k = 0; k < this.row; k++) {
          sum += A.matrix[i][k] * B.matrix[k][j];
        }
        C.matrix[i][j] = sum;
      }
    }
  },
  // REF: http://mrl.nyu.edu/~perlin/courses/spring2015/0311/simpleInvert.js
  invert: function (src, dst) {
    // COMPUTE ADJOINT COFACTOR MATRIX FOR THE ROTATION+SCALE 3x3
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var i0 = (i + 1) % 3;
        var i1 = (i + 2) % 3;
        var j0 = (j + 1) % 3;
        var j1 = (j + 2) % 3;
        dst.matrix[j + 4 * i] = src.matrix[i0 + 4 * j0] * src.matrix[i1 + 4 * j1] - src.matrix[i0 + 4 * j1] * src.matrix[i1 + 4 * j0];
      }
    }

    // RENORMALIZE BY DETERMINANT TO GET ROTATION+SCALE 3x3 INVERSE
    var determinant = src.matrix[0 + 4 * 0] * dst.matrix[0 + 4 * 0]
        + src.matrix[1 + 4 * 0] * dst.matrix[0 + 4 * 1]
        + src.matrix[2 + 4 * 0] * dst.matrix[0 + 4 * 2];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        dst.matrix[i + 4 * j] /= determinant;
      }
    }


    // COMPUTE INVERSE TRANSLATION
    for (var i = 0; i < 3; i++) {
      dst.matrix[i + 4 * 3] = -dst.matrix[i + 4 * 0] * src[0 + 4 * 3]
      - dst.matrix[i + 4 * 1] * src.matrix[1 + 4 * 3]
      - dst.matrix[i + 4 * 2] * src.matrix[2 + 4 * 3];
    }
  }
};


function Vector3(x, y, z) {
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.set(x, y, z);
}

Vector3.prototype = {
  set: function (x, y, z) {
    if (x !== undefined) this.x = x;
    if (y !== undefined) this.y = y;
    if (z !== undefined) this.z = z;
  },
  add: function(that) {
    this.x += that.x;
    this.y += that.y;
    this.z += that.z;
  },
  sub: function(that){
    this.x -= that.x;
    this.y -= that.y;
    this.z -= that.z;
  },
  mul: function (that) {
    this.x *= that.x;
    this.y *= that.y;
    this.z *= that.z;
  },
  div: function (that) {
    this.x /= that.x;
    this.y /= that.y;
    this.z /= that.z;
  },
  equals: function(that) {
    return Math.abs(this.x - that.x) < 0.001
        && Math.abs(this.y - that.y) < 0.001
        && Math.abs(this.z - that.z) < 0.001;
  },
  clone: function () {
    return new Vector3(this.x, this.y, this.z);
  },
  reverse: function () {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
  },
  length: function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
  },
  viewportTransformation: function (canvas) {
    var x = (canvas.width / 2.0) + this.x * (canvas.width / 2.0);
    var y = (canvas.height / 2.0) - this.y * (canvas.width / 2.0);
    this.x = x;
    this.y = y;
  },
  viewportReverseTransformation: function (canvas) {
    var x = (this.x - (canvas.width / 2.0)) / (canvas.width / 2.0);
    var y = -(this.y - (canvas.height / 2.0)) / (canvas.width / 2.0);
    this.x = x;
    this.y = y;
  },
  normalize: function (src, dst) {
    var dst = new Vector3(0, 0, 0);
    var length = Math.sqrt(Math.pow(src.x, 2) + Math.pow(src.y, 2) + Math.pow(src.z, 2));
    dst.x = src.x / length;
    dst.y = src.y / length;
    dst.z = src.z / length;
  },
  toArray: function () {
    var array = [];
    array[0] = this.x;
    array[1] = this.y;
    array[2] = this.z;
    return array;
  }
};

function Parametric(nu, nv, uv2xyz) {
  this.nu = nu;
  this.nv = nv;
  // Special tuning variable
  this.t1 = 1;
  this.t2 = 1;
  this.t3 = 1;
  // surface
  this.surface = [new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 0, 0)];
  this.uv2xyz = uv2xyz;
}

Parametric.prototype = {
  render: function (canvas, matrix, g) {
    var du = 1 / this.nu;
    var dv = 1 / this.nv;
    for (var u = 0; u < .999; u += du) {
      for (var v = 0; v < .999; v += dv) {
        this.uv2xyz(u, v, this.surface[0]);
        this.uv2xyz(u + du, v, this.surface[1]);
        this.uv2xyz(u + du, v + dv, this.surface[2]);
        this.uv2xyz(u, v + dv, this.surface[3]);
        drawSurface(canvas, matrix, g, this.surface);
      }
    }
  },
  changeShape: function (uv2xyz) {
    this.uv2xyz = uv2xyz;
  },
  tune: function (t1, t2, t3) {
    this.t1 = t1;
    this.t2 = t2;
    this.t3 = t3;
  }
};

function drawSurface(canvas, matrix, g, loop) {
  var edges = [[0, 1], [1, 2], [2, 3], [3, 0]];

  for (var edgeIndex in edges) {
    var edge = edges[edgeIndex];
    var vertex1 = new Vector3(0, 0, 0);
    var vertex2 = new Vector3(0, 0, 0);
    matrix.transform(loop[edge[0]], vertex1);
    matrix.transform(loop[edge[1]], vertex2);
    vertex1.viewportTransformation(canvas);
    vertex2.viewportTransformation(canvas);

    g.beginPath();
    g.moveTo(vertex1.x, vertex1.y);
    g.lineTo(vertex2.x, vertex2.y);
    g.stroke();
  }
}

function uv2xyzCylinder(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;

  var x = Math.sin(Theta);
  var y = 2 * v - 1;
  var z = Math.cos(Theta);
  dst.set(x, y, z);
}

function uv2xyzSphere(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;
  var Phi = Math.PI * v - Math.PI / 2;

  var x = Math.cos(Phi) * Math.sin(Theta);
  var y = Math.sin(Phi);
  var z = Math.cos(Phi) * Math.cos(Theta);
  dst.set(x, y, z);
}

function uv2xyzFlag(u, v, dst) {
  var x = 2 * u - 1;
  var y = 2 * v - 1;
  var z = .5 * (new Noise()).noise([3 * u, 3 * v, 3 * time]) * u;
  dst.set(x, y, z);
}

function uv2xyzRipple(u, v, dst) {
  var TAU = 2 * Math.PI;
  var x = 2 * u - 1;
  var y = 2 * v - 1;
  var z = Math.sin((Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) - time) * 15) / 10;
  dst.set(x, y, z);
}

// Ref: http://en.wikipedia.org/wiki/Superquadrics
function uv2xyzSuperquadric(u, v, dst) {
  function sgn(x) {
    if (x == 0) return x;
    return x > 0 ? 1 : -1;
  }

  function c(w, m) {
    return sgn(Math.cos(w)) * Math.pow(Math.abs(Math.cos(w)), m);
  }

  function s(w, m) {
    return sgn(Math.sin(w)) * Math.pow(Math.abs(Math.sin(w)), m);
  }

  var TAU = 2 * Math.PI;
  var Theta = TAU * u;
  var Phi = Math.PI * v - Math.PI / 2;

  var x = c(Phi, this.t1) * c(Theta, this.t1);
  var y = c(Phi, this.t2) * s(Theta, this.t2);
  var z = s(Phi, this.t3);
  dst.set(x, y, z);
}

function uv2xyzCurving(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;

  var x = Math.cos(time * u) * u * .6;
  var y = Math.sin(time * u) * u * .6;
  var z = v * .6;
  dst.set(x, y, z);
}

function uv2xyzSpring(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;

  var x = Math.sin(Theta * time);
  var y = 2 * v - 1;
  var z = Theta * Math.cos(time);
  dst.set(x, y, z);
}

function uv2xyzExperiment(u, v, dst) {
  var TAU = 2 * Math.PI;
  var Theta = TAU * u;
  var R = 1;
  var r = .5;
  var t = 1;

  var x = Math.sin(Theta * time);
  var y = 2 * v - 1;
  var z = Theta * Math.cos(time);
  dst.set(x, y, z);
}

function viewPortTransformation(pt, canvas) {
      var newpt = new Vector3(canvas.width/2 + pt.x*canvas.width/2, canvas.height/2 + -pt.y*canvas.height/2, pt.z);
      return newpt;
    }

function multiplyMatrices (m1, m2) {
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
    }