var fs = require('fs');
var path = require('path');
var markit = require('../');
var tools = require('./tools');

/**
 * Benchmark a function
 */

function bench(name, func) {
  var files = bench.files || tools.load();

  if (!bench.files) {
    bench.files = files;

    // Change certain tests to allow
    // comparison to older benchmark times.
    fs.readdirSync(__dirname + '/new').forEach(function(name) {
      if (path.extname(name) === '.html') return;
      if (name === 'main.text') return;
      delete files[name];
    });

    files['backslash_escapes.text'] = {
      text: 'hello world \\[how](are you) today'
    };

    files['main.text'].text = files['main.text'].text.replace('* * *\n\n', '');
  }

  var start = Date.now()
    , times = 1000
    , keys = Object.keys(files)
    , i
    , l = keys.length
    , filename
    , file;

  while (times--) {
    for (i = 0; i < l; i++) {
      filename = keys[i];
      file = files[filename];
      func(file.text);
    }
  }

  console.log('%s completed in %dms.', name, Date.now() - start);
}

/**
 * Benchmark all engines
 */

function run() {
  // Non-GFM, Non-pedantic
  var normalOptions = {
    gfm: false,
    tables: false,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false
  };
  markit.setOptions(normalOptions);
  bench('markit', markit);

  // GFM
  var gfmOptions = {
    gfm: true,
    tables: false,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: false
  };
  markit.setOptions(gfmOptions);
  bench('markit (gfm)', markit);

  // Pedantic
  pendanticOptions = {
    gfm: false,
    tables: false,
    breaks: false,
    pedantic: true,
    sanitize: false,
    smartLists: false
  };
  markit.setOptions(pendanticOptions);
  bench('markit (pedantic)', markit);

  // marked
  try {
    var marked = require('marked');

    marked.setOptions(normalOptions);
    bench('marked', marked);

    marked.setOptions(gfmOptions);
    bench('marked (gfm)', marked);

    marked.setOptions(pendanticOptions);
    bench('marked (pedantic)', marked);
  } catch (e) {
    console.log('Could not bench marked.');
  }

  // robotskirt
  try {
    bench('robotskirt', (function() {
      var rs = require('robotskirt');
      return function(text) {
        var parser = rs.Markdown.std();
        return parser.render(text);
      };
    })());
  } catch (e) {
    console.log('Could not bench robotskirt.');
  }

  // showdown
  try {
    bench('showdown (reuse converter)', (function() {
      var Showdown = require('showdown');
      var convert = new Showdown.converter();
      return function(text) {
        return convert.makeHtml(text);
      };
    })());
    bench('showdown (new converter)', (function() {
      var Showdown = require('showdown');
      return function(text) {
        var convert = new Showdown.converter();
        return convert.makeHtml(text);
      };
    })());
  } catch (e) {
    console.log('Could not bench showdown.');
  }

  // markdown.js
  try {
    bench('markdown.js', require('markdown').parse);
  } catch (e) {
    console.log('Could not bench markdown.js.');
  }
}

exports.run = run;
exports.bench = bench;
if (!module.parent) {
  tools.fix();
  run();
}
