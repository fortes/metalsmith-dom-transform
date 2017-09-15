/* eslint-env node */
const JSDOM = require('jsdom').JSDOM;
const {promisify} = require('util');

const HTML_FILENAME_REGEXP = /\.html$/;

// Hacky test to see if the content is a HTML file or just a fragment
function isFragment(html) {
  return !/<html/i.test(html);
}

async function runTransforms(file, transforms, files, metalsmith) {
  const data = files[file];
  const html = data.contents.toString();
  const useFragment = isFragment(html);

  let root;
  let dom;

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

  for (const transform of transforms) {
    try {
      await transform(root, file, {files, metalsmith});
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `Error during one of the DOM transforms of ${file}: ${err.message}`,
      );
    }
  }

  const newHtml = getHtml();

  if (newHtml !== previousHtml) {
    data.contents = new Buffer(getHtml());
  }
}

module.exports = function(options) {
  const transforms = options.transforms.map(promisify);

  return function(files, metalsmith, done) {
    const fileTransforms = Object.keys(files)
      .filter(file => HTML_FILENAME_REGEXP.test(file))
      .map(file => runTransforms(file, transforms, files, metalsmith));

    Promise.all(fileTransforms)
      .then(() => {})
      .then(done, done);
  };
};
