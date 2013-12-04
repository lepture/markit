var marked = require('../');
var tools = require('./tools');

/**
 * Test Runner
 */

function runTests(engine, options) {
  if (typeof engine !== 'function') {
    options = engine;
    engine = null;
  }

  var engine = engine || marked
    , options = options || {}
    , files = options.files || tools.load()
    , complete = 0
    , failed = 0
    , keys = Object.keys(files)
    , i = 0
    , len = keys.length
    , filename
    , file
    , flags
    , text
    , html
    , j
    , l;

  if (options.marked) {
    marked.setOptions(options.marked);
  }

main:
  for (; i < len; i++) {
    filename = keys[i];
    file = files[filename];

    if (marked._original) {
      marked.defaults = marked._original;
      delete marked._original;
    }

    flags = filename.split('.').slice(1, -1);
    if (flags.length) {
      marked._original = marked.defaults;
      marked.defaults = {};
      Object.keys(marked._original).forEach(function(key) {
        marked.defaults[key] = marked._original[key];
      });
      flags.forEach(function(key) {
        var val = true;
        if (key.indexOf('no') === 0) {
          key = key.substring(2);
          val = false;
        }
        if (marked.defaults.hasOwnProperty(key)) {
          marked.defaults[key] = val;
        }
      });
    }

    try {
      text = engine(file.text).replace(/\s/g, '');
      html = file.html.replace(/\s/g, '');
    } catch(e) {
      console.log('%s failed.', filename);
      throw e;
    }

    j = 0;
    l = html.length;

    for (; j < l; j++) {
      if (text[j] !== html[j]) {
        failed++;

        text = text.substring(
          Math.max(j - 30, 0),
          Math.min(j + 30, text.length));

        html = html.substring(
          Math.max(j - 30, 0),
          Math.min(j + 30, html.length));

        console.log(
          '\n#%d. %s failed at offset %d. Near: "%s".\n',
          i + 1, filename, j, text);

        console.log('\nGot:\n%s\n', text.trim() || text);
        console.log('\nExpected:\n%s\n', html.trim() || html);

        if (options.stop) {
          break main;
        }

        continue main;
      }
    }

    complete++;
    console.log('#%d. %s completed.', i + 1, filename);
  }

  console.log('%d/%d tests completed successfully.', complete, len);
  if (failed) console.log('%d/%d tests failed.', failed, len);

  return !failed;
}

if (!module.parent) {
  process.title = 'marked';
  tools.fix();
  process.exit(runTests() ? 0 : 1);
}
