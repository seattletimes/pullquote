// canvas should be 1200x630

var canvas = document.querySelector(".preview");
var context = canvas.getContext("2d");

var download = document.querySelector("a.download");
var textarea = document.querySelector("textarea");
textarea.value = textarea.value.trim();


var bg = {
  light: "#eee",
  dark: "#333",
  blue: "#88b"
};

var fg = {
  light: "#333",
  dark: "#eee",
  blue: "#eee"
};

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
  text = text
    .replace(/"(\w)/g, "“$1")
    .replace(/(\S)"/g, "$1”")
    .replace(/--/g, "—");
  context.clearRect(0, 0, canvas.width, canvas.height);
  //set the background color
  context.fillStyle = bg[settings.theme] || bg.light;
  context.fillRect(0, 0, canvas.width, canvas.height);
  //lay out the text
  settings.size *= 1;
  var lines = [];
  var padX = 24;
  var maxWidth = canvas.width - padX * 2;
  var position = 0;
  var buffer = "";
  context.fillStyle = fg[settings.theme] || fg.light;
  context.font = `${settings.size}px ${settings.font}`;
  while (position < text.length) {
    var char = text[position];
    if (char == "\n") {
      lines.push(buffer);
      position++;
      buffer = "";
      continue;
    }

    var metric = context.measureText(buffer);
    if (metric.width > maxWidth) {
      var words = buffer.split(" ");
      if (words.length > 1) {
        var last = words.pop();
        position -= last.length + 1;
      } else {
        position++;
      }
      lines.push(words.join(" "));
      buffer = "";
    } else {
      buffer += char;
    }
    position++;
  }
  if (buffer) {
    lines.push(buffer);
  }
  var lineY = canvas.height / 2 + settings.size / 2 - lines.length / 2 * settings.size;
  lines.forEach(function(l) {
    context.fillText(l, padX, lineY);
    lineY += settings.size;
  });
  var data = canvas.toDataURL();
  download.href = data;
};

render();

var everything = document.querySelectorAll("input, select, textarea");
for (var i = 0; i < everything.length; i++) {
  var element = everything[i];
  element.addEventListener("change", render);
  element.addEventListener("keyup", render);
}

canvas.addEventListener("click", () => download.click());

var bodyMutation = new MutationObserver(render);
// bodyMutation.observe(document.body, { attributes: true });