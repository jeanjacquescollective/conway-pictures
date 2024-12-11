// Code goes here
let c, ctx, stop = true, aliveOption = 'fourth';
let maxPixels = 320;
document.addEventListener("DOMContentLoaded", function() {
  c = document.getElementById('canvas');
  ctx = c.getContext('2d');

  c.onclick = function(){
    stop = !stop;
    setTimeout(doLife, 30);
  }
  let choices = [...document.getElementsByClassName('choice')];
  let images = [];

  choices.forEach((item, i) => {
    images.push(item.firstChild.src);
    item.onclick = function(){
      stop = true;
      scaleCanvas(item.firstChild, ctx);
      drawImageScaled(item.firstChild, ctx);
    }
  });


  shuffle(images);
  let optionsContainer = document.getElementById('images-options');


  let customImg = new Image();
  customImg.crossOrigin = "Anonymous";
  customImg.onload = function(){
    stop = true;

    let size = Math.min(this.width, this.height);
    scaleCanvas(customImg, ctx);
    drawImageScaled(customImg, ctx);
    //ctx.drawImage(customImg, (this.width-size)/2, (this.height-size)/2, size, size, 0, 0, 320, 320);
    customImg.src = '';
    setTimeout(function() {
      stop = false;
      doLife();
    }, 500);
  }

  customImg.onerror = function(){
    if(window.location.href != this.src)
      alert('Could not load image. Please try another one.');
  }

  let custom = document.getElementById('custom');
  let button = document.getElementById('custom-button');
  button.onclick = function(e){
    customImg.src = custom.value;
  }

  updateOptions();

  function addOptionClickHandler(o){
    o.onclick = function(){
      aliveOption = o.id;
      updateOptions();
    }
  }
  let options = document.getElementsByClassName('alive-option');
  for(let i=0; i<options.length; i++){
    addOptionClickHandler(options[i]);
  }
});


function drawImageScaled(img, ctx) {
   var canvas = ctx.canvas ;
   // canvas.width =  img.naturalWidth ;
   // canvas.height =  img.naturalHeight ;
   var hRatio = canvas.width  / img.naturalWidth    ;
   var vRatio =  canvas.height / img.naturalHeight  ;
   var ratio  = Math.min ( hRatio, vRatio );
   var centerShift_x = ( canvas.width - img.naturalWidth*ratio ) / 2;
   var centerShift_y = ( canvas.height - img.naturalHeight*ratio ) / 2;
   ctx.clearRect(0,0,canvas.width, canvas.height);
   ctx.drawImage(img, 0,0, img.naturalWidth, img.naturalHeight, centerShift_x,centerShift_y,img.naturalWidth*ratio, img.naturalHeight*ratio);
   //ctx.drawImage(img, 0,0);
}

function scaleCanvas(img, ctx) {
   var canvas = ctx.canvas ;
   var ratio = img.naturalWidth  / img.naturalHeight;
   console.log(ratio);
   let pixels = maxPixels;

   if(ratio > 1) {
     canvas.height = maxPixels;
     canvas.width = pixels * ratio;
     console.log(canvas.height);
     return;
   }
   canvas.width = maxPixels;
   canvas.height = pixels / ratio;
}

function updateOptions(){
  let options = document.getElementsByClassName('alive-option');
  for(let i=0; i<options.length; i++){
    let o = options[i];
    if(aliveOption == o.id){
      o.className = 'alive-option selected'
    } else {
      o.className = 'alive-option'
    }
  }
}

function updateSlider(slideAmount) {
        maxPixels = 320 * slideAmount / 50;
        console.log(slideAmount);
    }

function shuffle(o){
    for(let j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function randomColor() {
  return 'rgba(' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',' + Math.floor(Math.random() * 256) + ',1)';
}

// function fillRandom() {
//   for (let i = 0; i < 320; i++) {
//     for (let j = 0; j < 320; j++) {
//       ctx.fillStyle = randomColor();
//       ctx.fillRect(i, j, 1, 1);
//     }
//   }
// }

function doLife() {
  if(stop) return;

  // console.log(imageData);
  let canvas = document.createElement('canvas');
  // let pixels = 320;
  // let ratio = ctx.canvas.width / ctx.canvas.height;
  // let canvasWidth = 320, canvasHeight = 320;
  // if(ratio > 1){
  //   canvasHeight = 320 / ratio;
  // }
  // else{
  //   canvasWidth = 320 / ratio;
  // }
  let imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  let newData = canvas.getContext('2d').createImageData(ctx.canvas.width, ctx.canvas.height);
  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      let alive = isAlive(x, y, imageData);
      let aliveNeighbors = numAliveNeighbors(x, y, imageData);
      if (alive && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
        color = manCell(x, y, false, imageData);
      } else if (!alive && aliveNeighbors == 3) {
        color = manCell(x, y, true, imageData);
      } else {
        color = getColor(x, y, imageData);
      }
      // console.log(color);
      setColor(x, y, newData, color);
    }
  }
  ctx.putImageData(newData, 0, 0);
  if(!stop)
    requestAnimationFrame(doLife);
}


let isAliveFns = {};

isAliveFns['red'] = function(x,y,imageData){
  //red
  return imageData.data[y * imageData.width * 4 + x * 4 + 0]  > 200;
};

isAliveFns['green'] = function(x,y,imageData){
  //blue
  return imageData.data[y * imageData.width * 4 + x * 4 + 1]  > 200;
};

isAliveFns['blue'] = function(x,y,imageData){
  //green
  return imageData.data[y * imageData.width * 4 + x * 4 + 2]  > 200;
};

isAliveFns['half'] = function(x,y,imageData){
  //half
  let px = y * imageData.width * 4 + x * 4;
  return (imageData.data[px] + imageData.data[px+1] + imageData.data[px+2]) % 2 == 0;
};

isAliveFns['third'] = function(x,y,imageData){
  //third
  let px = y * imageData.width * 4 + x * 4;
  return (imageData.data[px] + imageData.data[px+1] + imageData.data[px+2]) % 3 == 0;
};

isAliveFns['fourth'] = function(x,y,imageData){
  //fourth
  let px = y * imageData.width * 4 + x * 4;
  return (imageData.data[px] + imageData.data[px+1] + imageData.data[px+2]) % 4 == 0;
};

isAliveFns['eight'] = function(x,y,imageData){
  //fourth
  let px = y * imageData.width * 4 + x * 4;
  return -(imageData.data[px] + imageData.data[px+1] + imageData.data[px+2]) % (Math.floor(Math.random() * 10)+2)   == 0;
};

function isAlive(x, y, imageData) {
  let fn = aliveOption || 'red';
  return isAliveFns[fn](x,y,imageData);
}

function numAliveNeighbors(x, y, imageData) {
  let numAlive = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (j === 0 && i === 0) continue;
      let newX = x + i;
      let newY = y + j;
      if (newX >= 0 && newY >= 0 && newX < imageData.width && newY < imageData.height && isAlive(newX, newY, imageData)) {
        numAlive++;
      }
    }
  }
  return numAlive;
}

function getColor(x, y, imageData) {
  return [
    imageData.data[y * imageData.width * 4 + x * 4],
    imageData.data[y * imageData.width * 4 + x * 4 + 1],
    imageData.data[y * imageData.width * 4 + x * 4 + 2],
    imageData.data[y * imageData.width * 4 + x * 4 + 3]
  ];
}

function setColor(x, y, imageData, color) {
  imageData.data[y * imageData.width * 4 + x * 4] = color[0];
  imageData.data[y * imageData.width * 4 + x * 4 + 1] = color[1];
  imageData.data[y * imageData.width * 4 + x * 4 + 2] = color[2];
  imageData.data[y * imageData.width * 4 + x * 4 + 3] = color[3];
}

function manCell(x, y, alive, imageData) {
  let colors = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (j === 0 && i === 0) continue;
      let newX = x + i;
      let newY = y + j;
      if (newX >= 0 && newY >= 0 && newX < imageData.width && newY < imageData.height) {
        let aliveCheck = isAlive(newX, newY, imageData);
        if (alive && aliveCheck || !alive && !aliveCheck) {
          colors.push(getColor(newX, newY, imageData));
        }
      }
    }
  }
  if (colors.length > 0) {
    return colors[Math.floor(Math.random() * colors.length) *0];
  }
  // console.log('huh...',x,y,alive, isAlive(x,y,imageData));
  return getColor(x, y, imageData);
  // return invert(getColor(x, y, imageData));
  // return [Math.floor(Math.random()*256),Math.floor(Math.random()*256),Math.floor(Math.random()*256),Math.floor(Math.random()*256)];
}

function invert(color) {
  return [255 - color[0], 255 - color[1], 255 - color[2], 255];
}
