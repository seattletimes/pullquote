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

var sizes = {
  facebook: [1200, 630],
  twitter: [1024, 512],
  instagram: [1080, 1080]
};

var getSettings = function() {
  var settings = {};
  var inputs = document.querySelectorAll("input[type=text], input[type=number], select");
  for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    settings[input.id] = input.value;
  }
  var checkboxes = document.querySelectorAll("input:checked");
  for (var i = 0; i < checkboxes.length; i++) {
    var box = checkboxes[i];
    settings[box.name] = box.value;
  }
  settings.size *= 1;
  return settings;
};

var layoutText = function(text, maxWidth) {
  var lines = [];
  var position = 0;
  var buffer = "";
  while (position < text.length) {
    var char = text[position];
    if (char == "\n") {
      lines.push({ text: buffer, width: context.measureText(buffer).width });
      position++;
      buffer = "";
      continue;
    }

    buffer += char;
    var metric = context.measureText(buffer);
    if (metric.width > maxWidth) {
      var words = buffer.split(" ");
      if (words.length > 1) {
        var last = words.pop();
        position -= last.length + 1;
      } else {
        position++;
      }
      words = words.join(" ");
      lines.push({ text: words, width: context.measureText(words).width });
      buffer = "";
    }
    position++;
  }
  if (buffer) {
    lines.push({ text: buffer, width: context.measureText(buffer).width });
  }
  console.log(lines);
  return lines;
};

var render = function() {
  var settings = getSettings();
  document.querySelector(".preview-aspect").setAttribute("aspect-ratio", settings.aspect);
  var size = sizes[settings.aspect];
  canvas.width = size[0];
  canvas.height = size[1];

  var text = textarea.value.trim();
  text = text
    .replace(/"(\w)/g, "“$1")
    .replace(/(\S)"/g, "$1”")
    .replace(/--/g, "—");
  //set the background color
  context.fillStyle = bg[settings.theme] || bg.light;
  context.fillRect(0, 0, canvas.width, canvas.height);
  //lay out the text
  context.fillStyle = fg[settings.theme] || fg.light;
  context.font = `${settings.size}px ${settings.font}`;
  var padding = 24;
  var maxWidth = canvas.width - padding * 2;
  var lines = layoutText(text, maxWidth);
  var lineY = padding + canvas.height / 2 + settings.size / 2 - lines.length / 2 * settings.size;
  if (settings.alignY == "top") {
    lineY = padding + settings.size;
  } else if (settings.alignY == "bottom") {
    lineY = canvas.height - lines.length * settings.size - padding;
  }
  lines.forEach(function(l) {
    var x = padding;
    if (settings.alignX == "right") {
      x = canvas.width - l.width - padding;
    } else if (settings.alignX == "center") {
      x = canvas.width / 2 - l.width / 2;
    }
    context.fillText(l.text, x, lineY);
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