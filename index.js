var cheerio = require('cheerio');
var decode = require('he').decode;
var plumb = require('plumb');


// "private" helper for ensuring html entities are properly escaped
function _escapeHtml (input) {
  return String(input)
   .replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#039;');
 }

// "private" helper for list processing into plaintext
function _list (str, isOrdered) {
  if (!str) return str;

  var $ = cheerio.load(str);
  var listEl = isOrdered ? 'ol' : 'ul';

  $(listEl).each(function (i, el) {
    var $out = cheerio.load('<p></p>');
    var $el = $(el);

    $el.find('li').each(function (j, li) {
      var tick = isOrdered ? String(j + 1) + '.' : '-';

      $out('p').append(tick + ' ' + _escapeHtml($(li).text()) + '<br />');
    });

    // avoid excess spacing coming off last element
    // (we are wrapping with a <p> anyway)
    $out('br').last().remove();

    $el.replaceWith($out.html());
  });

  return $.html();
}

function numToString(x) {
  if (typeof x === 'number')
    return x.toString()

  return x;
}

function stringify(x) {
  var output = x ? x.toString() : '';
  return output;
}

function collapseWhitespace (val) {
  var output = val.replace(/\s+/g, ' ');
  return output;
}

function linebreaks (str) {
  var output = str.replace(/<\s?(p|br)[^<]*>/gi, function (x, tag) {
    switch (tag.toLowerCase()) {
      case 'p':
        return '\n\n';
      case 'br':
        return '\n';
    }

    return x;
  });

  return output;
}

function listOrdered (str) {
  var output = _list(str, true);
  return output;
}

function listUnordered (str) {
  var output = _list(str, false);
  return output;
}

function stripTags (str) {
  var output = str.replace(/<[^<]+>/g, '');
  return output;
}

function trim (str) {
  return str.trim();
}


module.exports = plumb(
  numToString,
  listOrdered,
  listUnordered,
  stringify,
  collapseWhitespace,
  linebreaks,
  stripTags,
  decode,
  trim
);
