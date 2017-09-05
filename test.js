const assert = require('assert');
const domTransform = require('./index');

function getFixtures() {
  return {
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
}

const defaultFiles = getFixtures();
const defaultUse = domTransform({
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
});

defaultUse(defaultFiles, {}, err => {
  if (err) {
    assert.fail(err.message);
  }

  assert.equal(
    defaultFiles['bogus.jpg'].contents.toString(),
    getFixtures()['bogus.jpg'].contents.toString(),
    // 'No change to non-HTML file',
  );

  assert.equal(
    defaultFiles['fragment.html'].contents.toString(),
    '<div class="added">Root</div>',
    // 'Fragment not wrapped in HTML structure',
  );
  assert.equal(
    defaultFiles['doctype.html'].contents.toString(),
    '<!DOCTYPE html><html><head><title>Test Page</title></head><body><div class="added">this is the root</div><img src="hi.jpg" width="100"></body></html>',
    // 'Full document',
  );
});
