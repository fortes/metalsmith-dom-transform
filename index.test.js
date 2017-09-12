/* eslint-env jest,node */
const domTransform = require('./index');
const {promisify} = require('util');

let files;
let plugin;

beforeEach(() => {
  files = {
    'bogus.jpg': {
      contents: new Buffer('<p>Hi</p>'),
    },
    'fragment.html': {
      contents: new Buffer('<div>Root</div>'),
    },
    'doctype.html': {
      contents: new Buffer(
        '<!DOCTYPE html><html><head><title>Test Page</title></head><body><div>this is the root</div><img src="hi.jpg"></body></html>',
      ),
    },
    'nodoctype.html': {
      contents: new Buffer(
        '<html><head><title>Test Page</title></head><body><div>this is the root</div><img src="hi.jpg"></body></html>',
      ),
    },
  };

  plugin = promisify(
    domTransform({
      transforms: [
        (root, data, metalsmith, done) => {
          root.querySelector('div').classList.add('added');
          done();
        },
        (root, data, metalsmith, done) => {
          const image = root.querySelector('img');
          if (image) {
            image.setAttribute('width', 100);
          }
          // Make it async
          setTimeout(done, 50);
        },
      ],
    }),
  );

  return plugin(files, {});
});

test('no change to non-html file', () => {
  expect(files['bogus.jpg'].contents.toString()).toMatchSnapshot();
});

test('Fragment not wrapped in HTML structure', () => {
  expect(files['fragment.html'].contents.toString()).toMatchSnapshot();
});

test('Full document with doctype', () => {
  expect(files['doctype.html'].contents.toString()).toMatchSnapshot();
});

test('Full document without doctype', () => {
  expect(files['nodoctype.html'].contents.toString()).toMatchSnapshot();
});
