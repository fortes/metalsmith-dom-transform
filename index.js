const JSDOM = require('jsdom').JSDOM;

const HTML_FILENAME_REGEXP = /\.html$/;

// Hacky test to see if the content is a HTML file or just a fragment
function isFragment(html) {
  return !/<html/i.test(html);
}

function runTransforms(data, {transforms}) {
  let root;
  let dom;
  const html = data.contents.toString();
  const useFragment = isFragment(html);

  if (useFragment) {
    root = JSDOM.fragment(`<main data-wrapper>${html}</main>`);
  } else {
    dom = new JSDOM(data.contents);
    root = dom.window.document.documentElement;
  }

  return Promise.all(
    transforms.map(transform => {
      new Promise(resolve => {
        transform(root, data, err => {
          if (err) {
            reject(err);
          } else {
            resolve(root);
          }
        });
      });
    }),
  ).then(() => {
    if (useFragment) {
      data.contents = new Buffer(root.firstChild.innerHTML);
    } else {
      data.contents = new Buffer(dom.serialize());
    }
  });
}

module.exports = function(options) {
  return function(files, metalsmith, done) {
    const fileTransforms = [];

    for (var file in files) {
      if (HTML_FILENAME_REGEXP.test(file)) {
        fileTransforms.push(runTransforms(files[file], options));
      }
    }

    Promise.all(fileTransforms)
      .catch(err => {
        console.error(err.message);
      })
      .then(() => {
        done();
      });
  };
};
