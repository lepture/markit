# markit

A markdown parser and compiler. Forked from [marked](https://github.com/chjj/marked).

It has been 9 months since the [pr#129 on marked](https://github.com/chjj/marked/pull/129), and I've lost my patience. That's why I created this project.

Anyone who doesn't need renderer feature, use marked instead, please.

## Installation

Install with npm:

    $ npm install markit --save

Install with [component(1)](http://component.io):

    $ component install lepture/markit

## Usage

Minimal usage:

```javascript
var markit = require('markit');
console.log(markit('I am using **markdown**.'));
// Outputs: <p>I am using <strong>markdown</strong>.</p>
```

## Options

Default options:

    gfm: true
    tables: true
    breaks: false
    pedantic: false
    sanitize: false
    smartLists: false
    silent: false
    smartypants: false

## Renderer

Custom renderer:

```javascript
var r = new markit.Renderer()
r.blockcode = function(code, lang) {
    return highlight(code, lang);
}

console.log(markit(text, {renderer: r}))
```

Available methods:

### Block Level

- blockcode(code, language)
- blockquote(quote)
- blockhtml(html)
- header(text, level)
- hrule()
- list(body, ordered)
- listitem(text)
- paragraph(text)
- table(header, body)
- tablerow(content)
- tablecell(content, flags)

flags in tablecell:

```
Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};
```

### Span Level

- strong(text)
- emphasis(text)
- codespan(code)
- linebreak()
- strikethrough(text)
- link(href, title, text)
- image(href, title, text)

## API

### markit(text, [options], [callback])

Alias: `markit.parse`.

Parse and compile text into html.

### markit.Parser(options, [renderer])

Actually, you don't need this API.

### markit.Lexer(options)

Actually, you don't need this API.

### markit.InlineLexer(options)

Actually, you don't need this API.

### markit.Renderer()

See Renderer section for more detail.

## Bonus

You can create a standalone script with:

    $ make standalone

## License

MIT
