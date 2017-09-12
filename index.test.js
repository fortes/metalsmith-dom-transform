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
  };

  plugin = promisify(
    domTransform({
      transforms: [
        (root, data, done) => {
          root.querySelector('div').classList.add('added');
          done();
        },
        (root, data, done) => {
          const image = root.querySelector('img');
          if (image) {
            image.setAttribute('width', 100);
          }
          // Make it async
          setImmediate(done);
        },
      ],
    }),
  );

  return plugin(files, {});
});

test('no change to non-html file', () => {
  expect(files['bogus.jpg'].contents.toString()).toBe('<p>Hi</p>');
});

test('Fragment not wrapped in HTML structure', () => {
  expect(files['fragment.html'].contents.toString()).toBe(
    '<div class="added">Root</div>',
  );
});

test('Full document', () => {
  expect(files['doctype.html'].contents.toString()).toBe(
    '<!DOCTYPE html><html><head><title>Test Page</title></head><body><div class="added">this is the root</div><img src="hi.jpg" width="100"></body></html>',
  );
});
