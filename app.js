// canvas should be 1200x630

var canvas = document.querySelector(".preview");
var context = canvas.getContext("2d");

var textarea = document.querySelector("textarea");

var getSettings = function() {
  var settings = {};
  var inputs = document.querySelectorAll("input, select");
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    settings[input.id] = input.value;
  }
  return settings;
}

var render = function() {
  var settings = getSettings();
  var text = textarea.value.trim();
  context.clearRect(0, 0, canvas.width, canvas.height);
  //set the background color
  switch (settings.background) {
    case "light":
      break;

    default:
      context.fillStyle = "#88B";
      context.fillRect(0, 0, canvas.width, canvas.height);
  }
  //lay out the text
  settings.size *= 1;
  var textY = 24 + settings.size;
  var padX = 24;
  var maxWidth = canvas.width - padX * 2;
  var position = 0;
  var buffer = "";
  context.fillStyle = "white";
  context.font = `${settings.size}px ${settings.font}`;
  while (position < text.length) {
    var char = text[position];
    if (char == "\n") {
      context.fillText(buffer, padX, textY);
      position++;
      buffer = "";
      textY += settings.size;
      continue;
    }

    var metric = context.measureText(buffer);
    if (metric.width > maxWidth) {
      var words = buffer.split(" ");
      var last = words.pop();
      context.fillText(words.join(" "), padX, textY);
      position -= last.length + 1;
      buffer = "";
      textY += settings.size;
    } else {
      buffer += char;
    }
    position++;
  }
  if (buffer) {
    context.fillText(buffer, padX, textY);
  }
  //add watermark?
  //set the download link
};

render();