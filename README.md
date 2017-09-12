# metalsmith-dom-transform

[![build status](https://travis-ci.org/fortes/metalsmith-dom-transform.svg?branch=master)](https://travis-ci.org/fortes/metalsmith-dom-transform/) [![codecov](https://codecov.io/gh/fortes/metalsmith-dom-transform/branch/master/graph/badge.svg)](https://codecov.io/gh/fortes/metalsmith-dom-transform) [![Greenkeeper badge](https://badges.greenkeeper.io/fortes/metalsmith-dom-transform.svg)](https://greenkeeper.io/)

Infrastructure plugin for transforming page DOM via [jsdom](https://github.com/tmpvar/jsdom). Use this for small tweaks, or build your plugin on top of this one.

## Example

```js
var domTransform = require('metalsmith-dom-transform');

metalsmith.use(
  domTransform({
    transforms: [
      // Set target=_blank on all links
      function(dom, data, metalsmith, done) {
        const links = dom.querySelectorAll('a[href]');
        for (let i = 0; i < links.length; i++) {
          links[i].target = '_blank';
        }

        done();
      },

      // Make all images 200px wide
      function(dom, data, metalsmith, done) {
        const img = dom.querySelectorAll('img');
        for (let i = 0; i < pre.length; i++) {
          img.width = 200;
        }

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
  * `data`: Metalsmith object for the page, contains metadata, etc.
  * `metalsmith`: Metalsmith instance, passed to all plugins
  * `done`: Callback for transformation completion

## Requirements

Uses Promises, so requires a relatively recent (4.x or higher) version of node.

## Plugins built on this one

* [`metalsmith-code-highlight`](https://github.com/fortes/metalsmith-code-highlight)

## Changelog

* `1.0.0`: Add `metalsmith` parameter
* `0.0.2`: Fix stupid bug where async did not work
* `0.0.1`: Initial release

## Alternatives

* [metalsmith-batch-dom](https://github.com/krambuhl/metalsmith-batch-dom): Manipulations based on query selectors and Cheerio, no metadata, all transforms must be synchronous.
