# metalsmith-dom-transform

[![build status](https://travis-ci.org/fortes/metalsmith-dom-transform.svg?branch=master)](https://travis-ci.org/fortes/metalsmith-dom-transform/) [![codecov](https://codecov.io/gh/fortes/metalsmith-dom-transform/branch/master/graph/badge.svg)](https://codecov.io/gh/fortes/metalsmith-dom-transform) [![Greenkeeper badge](https://badges.greenkeeper.io/fortes/metalsmith-dom-transform.svg)](https://greenkeeper.io/)

Infrastructure plugin for transforming page DOM via [jsdom](https://github.com/tmpvar/jsdom). Use this for small tweaks, or build your plugin on top of this one.

## Example

```js
const domTransform = require('metalsmith-dom-transform');

metalsmith.use(
  domTransform({
    transforms: [
      // Set target=_blank on all links
      function(dom, file, {files, metalsmith}, done) {
        Array.from(dom.querySelectorAll('a[href]')).forEach(link => {
          link.target = '_blank';
        });

        done();
      },

      // Make all images 200px wide
      function(dom, file, {files, metalsmith}, done) {
        Array.from(dom.querySelectorAll('img')).forEach(img => {
          img.width = 200;
        });

        done();
      },

      // Remove all <iframe> elements
      function(dom, file, {files, metalsmith}, done) {
        Array.from(dom.querySelectorAll('iframe')).forEach(iframe => {
          iframe.remove();
        });

        done();
      }
    ]
  })
);
```

### Configuration

There is currently only one option:

* `transforms`: array of functions that serve as DOM transformations. Each function takes three arguments:
  * `dom`: The root of the DOM for that page
  * `file`: File path for the page being transformed
  * `info`: Object that holds the same arguments passed to all metalsmith plugins, namely:
    * `files`: Dictionary of all files being processed by this metalsmith instance
    * `metalsmith`: Metalsmith instance
  * `done`: Callback for transformation completion

## Requirements

Uses `async`/`await`, so requires a relatively recent (8.x or higher) version of node.

## Plugins built on this one

* [`metalsmith-code-highlight`](https://github.com/fortes/metalsmith-code-highlight)
* [`metalsmith-image-dimensions`](https://github.com/fortes/metalsmith-image-dimensions)

If you create a plugin on top of this one, add a pull request and add yours to this list.

## Changelog

* `2.0.1`: Upgrade dependencies
* `2.0.0`: Change transform function parameters
* `1.0.1`: Don't serialize HTML if nothing changed (may cause HTML output differences)
* `1.0.0`: Add `metalsmith` parameter
* `0.0.2`: Fix stupid bug where async did not work
* `0.0.1`: Initial release

## Alternatives

* [metalsmith-batch-dom](https://github.com/krambuhl/metalsmith-batch-dom): Manipulations based on query selectors and Cheerio, no metadata, all transforms must be synchronous.
