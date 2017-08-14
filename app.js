// canvas should be 1200x630

var canvas = document.querySelector(".preview");
var context = canvas.getContext("2d");

var formatting = document.querySelector(".formatting");
var download = document.querySelector("a.download");
var textarea = document.querySelector("textarea.quote");
textarea.value = textarea.value.trim();
var attribution = document.querySelector("input.attribution")

var bug = new Image();
bug.src = "ST.svg";
bug.width = 100;
bug.height = 100;
bug.onload = function() {
  render();
}

var state = {
  bug: "top left"
};

var bg = {
  light: "#eee",
  dark: "#333",
  blue: "#335",
  black: "black"
};

var fg = {
  light: "#333",
  dark: "#eee",
  blue: "#ddf",
  black: "#eee"
};

var sizes = {
  facebook: [1200, 630],
  twitter: [1024, 512],
  instagram: [1080, 1080]
};

var getSettings = function() {
  var settings = {};
  var inputs = formatting.querySelectorAll("input[type=text], input[type=number], input[type=range], select");
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    settings[input.id] = input.value;
  }
  var checkboxes = formatting.querySelectorAll("input:checked");
  for (var i = 0; i < checkboxes.length; i++) {
    var box = checkboxes[i];
    settings[box.name] = box.value;
  }
  settings.size *= 1;
  settings.padding *= 1;
  settings.attributionSize *= 1;
  return settings;
};

var layoutText = function(text, maxWidth, font, size) {
  var lines = [];
  var position = 0;
  var buffer = "";
  context.font = `${size}px ${font}`;
  var die = 0;
  while (position < text.length && die < 10000) {
    die++;
    var char = text[position];
    if (char == "\n") {
      lines.push({ text: buffer, width: context.measureText(buffer).width, size });
      position++;
      buffer = "";
      continue;
    }

    buffer += char;
    var metric = context.measureText(buffer);
    if (metric.width > maxWidth) {
      var words = buffer.trim().split(" ");
      if (words.length > 1) {
        var last = words.pop();
        if (context.measureText(last).width < maxWidth) {
          //check for overrun
          position -= last.length + 1;
        }
      } else {
        position++;
      }
      words = words.join(" ");
      lines.push({ text: words, width: context.measureText(words).width, size });
      buffer = "";
    }
    position++;
  }
  if (buffer) {
    lines.push({ text: buffer.trim(), width: context.measureText(buffer).width, size });
  }
  return lines;
};

var loadImage = function(f) {
  if (!f.name.match(/(jpg|jpeg|png|gif)$/i)) return;
  var reader = new FileReader();
  reader.onload = function() {
    console.log(`Read image: ${f.name}`);
    var image = state.image = new Image();
    state.image.onload = function() {
      var w = canvas.width;
      var h = image.height * (w / image.width);
      if (h < canvas.height) {
        h = canvas.height;
        w = image.width * (h / image.height);
      }
      state.width = w;
      state.height = h;
      state.cx = canvas.width / 2;
      state.cy = canvas.height / 2;
      render();
    };
    state.image.src = reader.result;
  }
  reader.readAsDataURL(f);
}

var drawImage = function(opacity) {
  var x = state.cx - state.width / 2;
  var y = state.cy - state.height / 2;
  context.globalAlpha = opacity;
  context.drawImage(state.image, x, y, state.width, state.height);
  context.globalAlpha = 1;
};

var drawBug = function() {
  var x = 0;
  var y = 0;
  bug.width = bug.height = canvas.width / 10;
  if (state.bug.indexOf("bottom") > -1) {
    y = canvas.height - bug.height;
  }
  if (state.bug.indexOf("right") > -1) {
    x = canvas.width - bug.width;
  }
  context.drawImage(bug, x, y, bug.width, bug.height);
};

var render = function() {
  var settings = getSettings();
  var size = sizes[settings.aspect];
  canvas.width = size[0];
  canvas.height = size[1];

  var text = textarea.value.trim();
  text = text
    .replace(/"(\w)/g, "“$1")
    .replace(/(\S)"/g, "$1”")
    .replace(/--/g, "—");
  var attr = attribution.value.trim();
  
  //set the background color
  context.fillStyle = bg[settings.theme] || bg.light;
  context.fillRect(0, 0, canvas.width, canvas.height);

  //add the image
  if (state.image) drawImage(settings.opacity);
  //add the bug
  drawBug();
  
  //lay out the text
  context.fillStyle = fg[settings.theme] || fg.light;
  var padding = settings.padding;
  var maxWidth = canvas.width - padding * 2;
  var lines = layoutText(text, maxWidth, settings.font, settings.size);
  if (attr) {
    var attrLines = layoutText("    — " + attr, maxWidth, settings.font, settings.attributionSize);
    attrLines.forEach(l => l.alignment = "right");
    lines = lines.concat(attrLines);
  }
  var height = lines.reduce((t, l) => t + l.size, 0);
  
  //draw the text
  var lineY = canvas.height / 2 - height / 2 + settings.size / 2;
  if (settings.alignY == "top") {
    lineY = padding + settings.size;
  } else if (settings.alignY == "bottom") {
    lineY = canvas.height - height - padding + settings.size / 2;
  }
  lines.forEach(function(l) {
    var x = padding;
    var alignment = l.alignment || settings.alignX;
    if (alignment == "right") {
      x = canvas.width - padding;
    } else if (alignment == "center") {
      x = canvas.width / 2;
    }
    context.textAlign = alignment;
    context.font = `${l.size}px ${settings.font}`;
    context.fillText(l.text, x, lineY);
    lineY += l.size;
  });
};

render();

var everything = document.querySelectorAll("input, select, textarea");
for (var i = 0; i < everything.length; i++) {
  var element = everything[i];
  element.addEventListener("change", render);
  element.addEventListener("keyup", render);
};

//set the download link on-demand, it's expensive
download.addEventListener("click", function() {
  var data = canvas.toDataURL();
  download.href = data;
});

var cancel = function(e) { e.preventDefault() };

canvas.addEventListener("dragenter", cancel);
canvas.addEventListener("dragover", cancel);
canvas.addEventListener("drop", function(e) {
  e.preventDefault();
  if (!e.dataTransfer || !e.dataTransfer.files) return;
  var f = e.dataTransfer.files[0];
  loadImage(f);
});

var fileInput = document.querySelector("#file");
fileInput.addEventListener("change", function() {
  var f = fileInput.files[0];
  loadImage(f);
});

document.querySelector(".set-image").addEventListener("click", function() {
  if (state.image) {
    state.image = null;
    render();
  } else {
    fileInput.click();
  }
});

canvas.addEventListener("mousedown", function(e) {
  state.coords = [e.clientX, e.clientY];
  state.moved = false;
});

canvas.addEventListener("mousemove", function(e) {
  if (!state.coords) return;
  var dx = e.clientX - state.coords[0];
  var dy = e.clientY - state.coords[1]
  state.cx += dx;
  state.cy += dy;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) state.moved = true;
  state.coords = [e.clientX, e.clientY];
  render();
});

canvas.addEventListener("mouseup", function(e) {
  if (!state.moved) {
    var bounds = canvas.getBoundingClientRect();
    var x = state.coords[0] - bounds.left;
    var y = state.coords[1] - bounds.top;
    state.bug = x < canvas.width / 2 ? "left " : "right ";
    state.bug += y < canvas.height / 2 ? "top" : "bottom";
    render()
  }
  state.moved = false;
  state.coords = null;
});

canvas.addEventListener("wheel", function(e) {
  if (!state.width) return;
  var scale = .8;
  if (e.deltaY > 0) {
    scale = 1.1;
  }
  state.width *= scale;
  state.height *= scale;
  render();
})