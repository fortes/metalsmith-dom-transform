const JSDOM = require('jsdom').JSDOM;

const HTML_FILENAME_REGEXP = /\.html$/;

// Hacky test to see if the content is a HTML file or just a fragment
function isFragment(html) {
  return !/<html/i.test(html);
}

function runTransforms(data, {transforms}, metalsmith) {
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

  const getHtml = useFragment
    ? () => root.firstChild.innerHTML
    : () => dom.serialize();

  const previousHtml = getHtml();

  return Promise.all(
    transforms.map(transform => {
      return new Promise((resolve, reject) => {
        transform(root, data, metalsmith, err => {
          if (err) {
            reject(err);
          } else {
            resolve(root);
          }
        });
      });
    }),
  ).then(() => {
    const newHtml = getHtml();

    if (newHtml !== previousHtml) {
      data.contents = new Buffer(getHtml());
    }
  });
}

module.exports = function(options) {
  return function(files, metalsmith, done) {
    const fileTransforms = [];

    for (var file in files) {
      if (HTML_FILENAME_REGEXP.test(file)) {
        fileTransforms.push(runTransforms(files[file], options, metalsmith));
      }
    }

    Promise.all(fileTransforms)
      .catch(err => {
        console.error(`Error during DOM transform of ${file}: ${err.message}`);
      })
      .then(() => {
        done();
      });
  };
};
