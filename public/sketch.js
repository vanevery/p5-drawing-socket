let socket;

let colorPalette;
let brushSize;
let clearButton;
let saveButton;

let canvas;
let graphics;

let drawingChanged = false;

function setup() {

  socket = io.connect();
					
	socket.on('connect', function() {
		console.log("Connected");
	});

  socket.on('draw', function(data) {
    graphics.fill(data.c);
    graphics.noStroke();
    graphics.ellipse(data.x, data.y, data.s, data.s);
    graphics.stroke(data.c);
    graphics.strokeWeight(data.s);
    graphics.line(data.x, data.y, data.px, data.py);    
  });

  socket.on('clear', function() {
    graphics.background(128);
  });

  canvas = createCanvas(1024,576);
  canvas.position(windowWidth/2-1024/2,0);

  graphics = createGraphics(canvas.width, canvas.height);
  graphics.background(128);

  let colorDiv = createDiv('Color');
  colorDiv.style('font-size', '18px');
  colorDiv.position(windowWidth/2-1024/2+10, canvas.height+10);

  colorPalette = createColorPicker('#000000');
  colorPalette.size(50,30);
  colorPalette.position(windowWidth/2-1024/2+10,canvas.height+32);

  let sizeDiv = createDiv('Size');
  sizeDiv.style('font-size', '18px');
  sizeDiv.position(windowWidth/2-1024/2+100, canvas.height+10);

  brushSize = createSlider(1,50,10);
  brushSize.position(windowWidth/2-1024/2+100,canvas.height+35);

  // clearButton = createButton("Clear");
  // clearButton.position(windowWidth/2-1024/2+canvas.width - 50, canvas.height + 10);
  // clearButton.mousePressed(function () {
  //   graphics.background(128);
  //   socket.emit('clear');
  // });

  // saveButton = createButton("Save");
  // saveButton.position(windowWidth/2-1024/2+canvas.width - 100, canvas.height + 10);
  // saveButton.mousePressed(function () {
  //   saveCanvas(canvas);
  // });

  noStroke();
  fill(255);
}

function draw() {
  //background(128);
  image(graphics,0,0);

  stroke(255);
  strokeWeight(1);
  noFill();
  ellipse(mouseX, mouseY, brushSize.value(), brushSize.value());

  if (mouseIsPressed) {
    graphics.fill(colorPalette.value());
    graphics.noStroke();
    graphics.ellipse(mouseX, mouseY, brushSize.value(), brushSize.value());
    graphics.stroke(colorPalette.value());
    graphics.strokeWeight(brushSize.value());
    graphics.line(mouseX, mouseY, pmouseX, pmouseY);
  }
}

function mouseDragged() {
  let data = {x: mouseX, y: mouseY, px: pmouseX, py: pmouseY, c: colorPalette.value(), s: brushSize.value()};
  socket.emit('draw', data);  
}
