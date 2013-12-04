var fs = require('fs');
var path = require('path');

var casesdir = path.resolve(__dirname, 'cases');


function load() {
  var files = {}, list, file, i, l;

  list = fs
    .readdirSync(casesdir)
    .filter(function(file) {
      return path.extname(file) !== '.html';
    })
    .sort(function(a, b) {
      a = path.basename(a).toLowerCase().charCodeAt(0);
      b = path.basename(b).toLowerCase().charCodeAt(0);
      return a > b ? 1 : (a < b ? -1 : 0);
    });

  i = 0;
  l = list.length;

  for (; i < l; i++) {
    file = path.join(casesdir, list[i]);
    files[path.basename(file)] = {
      text: fs.readFileSync(file, 'utf8'),
      html: fs.readFileSync(file.replace(/[^.]+$/, 'html'), 'utf8')
    };
  }

  return files;
}
exports.load = load;


/**
 * Markdown Test Suite Fixer
 *   This function is responsible for "fixing"
 *   the markdown test suite. There are
 *   certain aspects of the suite that
 *   are strange or might make tests
 *   fail for reasons unrelated to
 *   conformance.
 */

function fix() {
  try {
    fs.mkdirSync(casesdir, 0755);
  } catch (e) {
  }

  // rm -rf cases
  fs.readdirSync(casesdir).forEach(function(file) {
    fs.unlinkSync(path.resolve(casesdir, file));
  });

  // cp -r original cases
  fs.readdirSync(path.resolve(__dirname, 'original')).forEach(function(file) {
    var nfile = file;
    if (file.indexOf('hard_wrapped_paragraphs_with_list_like_lines.') === 0) {
      nfile = file.replace(/\.(text|html)$/, '.nogfm.$1');
    }
    fs.writeFileSync(
      path.resolve(casesdir, nfile),
      fs.readFileSync(path.resolve(__dirname, 'original', file))
    );
  });

  fs.readdirSync(casesdir).filter(function(file) {
    return path.extname(file) === '.html';
  }).forEach(function(file) {
    file = path.join(casesdir, file);

    var html = fs.readFileSync(file, 'utf8');

    // fix unencoded quotes
    html = html
      .replace(/='([^\n']*)'(?=[^<>\n]*>)/g, '=&__APOS__;$1&__APOS__;')
      .replace(/="([^\n"]*)"(?=[^<>\n]*>)/g, '=&__QUOT__;$1&__QUOT__;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/&__QUOT__;/g, '"')
      .replace(/&__APOS__;/g, '\'');
    fs.writeFileSync(file, html);
  });

  // turn <hr /> into <hr>
  fs.readdirSync(casesdir).forEach(function(file) {
    file = path.join(casesdir, file);
    var text = fs.readFileSync(file, 'utf8');
    text = text.replace(/(<|&lt;)hr\s*\/(>|&gt;)/g, '$1hr$2');
    fs.writeFileSync(file, text);
  });

  // markdown does some strange things.
  // it does not encode naked `>`, marked does.
  (function() {
    var file = casesdir + '/amps_and_angles_encoding.html';
    var html = fs.readFileSync(file, 'utf8')
      .replace('6 > 5.', '6 &gt; 5.');

    fs.writeFileSync(file, html);
  })();

  // cp new/* cases/
  fs.readdirSync(path.resolve(__dirname, 'new')).forEach(function(file) {
    fs.writeFileSync(
      path.resolve(casesdir, file),
      fs.readFileSync(path.resolve(__dirname, 'new', file))
    );
  });
}

exports.fix = fix;
