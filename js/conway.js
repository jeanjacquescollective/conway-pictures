let c, ctx, stop = true, aliveOption = 'fourth';
let maxPixels = 320;

document.addEventListener("DOMContentLoaded", function() {
  c = document.getElementById('canvas');
  ctx = c.getContext('2d');

  c.onclick = function() {
    stop = !stop;
    setTimeout(doLife, 30);
  };

  const choices = [...document.getElementsByClassName('choice')];
  const images = choices.map(item => item.firstChild.src);

  choices.forEach((item) => {
    item.onclick = function() {
      stop = true;
      scaleCanvas(item.firstChild, ctx);
      drawImageScaled(item.firstChild, ctx);
    };
  });

  shuffle(images);
  const optionsContainer = document.getElementById('images-options');

  const customImg = new Image();
  customImg.crossOrigin = "anonymous";
  customImg.onload = function() {
    stop = true;
    scaleCanvas(customImg, ctx);
    drawImageScaled(customImg, ctx);
    customImg.src = '';
    setTimeout(() => {
      stop = false;
      doLife();
    }, 500);
  };

  customImg.onerror = function() {
    if (window.location.href !== this.src) {
      alert('Could not load image. Please try another one.');
    }
  };

  const custom = document.getElementById('custom-url');
  const button = document.getElementById('custom-button');
  button.onclick = function() {
    customImg.src = '' + custom.value;
  };

  updateOptions();

  const options = document.getElementsByClassName('alive-option');
  for (let i = 0; i < options.length; i++) {
    addOptionClickHandler(options[i]);
  }

  function addOptionClickHandler(option) {
    option.onclick = function() {
      aliveOption = option.id;
      updateOptions();
    };
  }
});

function drawImageScaled(img, ctx) {
  const canvas = ctx.canvas;
  const hRatio = canvas.width / img.naturalWidth;
  const vRatio = canvas.height / img.naturalHeight;
  const ratio = Math.min(hRatio, vRatio);
  const centerShift_x = (canvas.width - img.naturalWidth * ratio) / 2;
  const centerShift_y = (canvas.height - img.naturalHeight * ratio) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, centerShift_x, centerShift_y, img.naturalWidth * ratio, img.naturalHeight * ratio);
}

function scaleCanvas(img, ctx) {
  const canvas = ctx.canvas;
  const ratio = img.naturalWidth / img.naturalHeight;
  const pixels = maxPixels;

  if (ratio > 1) {
    canvas.height = maxPixels;
    canvas.width = pixels * ratio;
  } else {
    canvas.width = maxPixels;
    canvas.height = pixels / ratio;
  }
}

function updateOptions() {
  const options = document.getElementsByClassName('alive-option');
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    option.className = aliveOption === option.id ? 'alive-option selected' : 'alive-option';
  }
}

function updateSlider(slideAmount) {
  maxPixels = 320 * slideAmount / 50;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomColor() {
  return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`;
}

function doLife() {
  if (stop) return;

  const canvas = document.createElement('canvas');
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const newData = canvas.getContext('2d').createImageData(ctx.canvas.width, ctx.canvas.height);

  for (let x = 0; x < imageData.width; x++) {
    for (let y = 0; y < imageData.height; y++) {
      const alive = isAlive(x, y, imageData);
      const aliveNeighbors = numAliveNeighbors(x, y, imageData);
      let color;

      if (alive && (aliveNeighbors < 2 || aliveNeighbors > 3)) {
        color = manCell(x, y, false, imageData);
      } else if (!alive && aliveNeighbors === 3) {
        color = manCell(x, y, true, imageData);
      } else {
        color = getColor(x, y, imageData);
      }

      setColor(x, y, newData, color);
    }
  }

  ctx.putImageData(newData, 0, 0);
  if (!stop) requestAnimationFrame(doLife);
}

const isAliveFns = {
  red: (x, y, imageData) => imageData.data[y * imageData.width * 4 + x * 4] > 200,
  green: (x, y, imageData) => imageData.data[y * imageData.width * 4 + x * 4 + 1] > 200,
  blue: (x, y, imageData) => imageData.data[y * imageData.width * 4 + x * 4 + 2] > 200,
  half: (x, y, imageData) => (imageData.data[y * imageData.width * 4 + x * 4] + imageData.data[y * imageData.width * 4 + x * 4 + 1] + imageData.data[y * imageData.width * 4 + x * 4 + 2]) % 2 === 0,
  third: (x, y, imageData) => (imageData.data[y * imageData.width * 4 + x * 4] + imageData.data[y * imageData.width * 4 + x * 4 + 1] + imageData.data[y * imageData.width * 4 + x * 4 + 2]) % 3 === 0,
  fourth: (x, y, imageData) => (imageData.data[y * imageData.width * 4 + x * 4] + imageData.data[y * imageData.width * 4 + x * 4 + 1] + imageData.data[y * imageData.width * 4 + x * 4 + 2]) % 4 === 0,
  eight: (x, y, imageData) => -(imageData.data[y * imageData.width * 4 + x * 4] + imageData.data[y * imageData.width * 4 + x * 4 + 1] + imageData.data[y * imageData.width * 4 + x * 4 + 2]) % (Math.floor(Math.random() * 10) + 2) === 0
};

function isAlive(x, y, imageData) {
  return isAliveFns[aliveOption](x, y, imageData);
}

function numAliveNeighbors(x, y, imageData) {
  let numAlive = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newX = x + i;
      const newY = y + j;
      if (newX >= 0 && newY >= 0 && newX < imageData.width && newY < imageData.height && isAlive(newX, newY, imageData)) {
        numAlive++;
      }
    }
  }
  return numAlive;
}

function getColor(x, y, imageData) {
  const index = y * imageData.width * 4 + x * 4;
  return [
    imageData.data[index],
    imageData.data[index + 1],
    imageData.data[index + 2],
    imageData.data[index + 3]
  ];
}

function setColor(x, y, imageData, color) {
  const index = y * imageData.width * 4 + x * 4;
  imageData.data[index] = color[0];
  imageData.data[index + 1] = color[1];
  imageData.data[index + 2] = color[2];
  imageData.data[index + 3] = color[3];
}

function manCell(x, y, alive, imageData) {
  const colors = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newX = x + i;
      const newY = y + j;
      if (newX >= 0 && newY >= 0 && newX < imageData.width && newY < imageData.height) {
        const aliveCheck = isAlive(newX, newY, imageData);
        if ((alive && aliveCheck) || (!alive && !aliveCheck)) {
          colors.push(getColor(newX, newY, imageData));
        }
      }
    }
  }
  return colors.length > 0 ? colors[Math.floor(Math.random() * colors.length)] : getColor(x, y, imageData);
}

function invert(color) {
  return [255 - color[0], 255 - color[1], 255 - color[2], 255];
}
