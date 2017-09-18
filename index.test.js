/* eslint-env jest,node */
const domTransform = require('./index');
const {promisify} = require('util');

jest.useFakeTimers();

const files = {
  'ignore-non-html.jpg': {
    contents: new Buffer('<div>Hi</div>'),
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
  'nochanges.html': {
    contents: new Buffer('<title>Test Page</title><p>nothing <em>here'),
  },
  'invalid.html': {
    contents: new Buffer('<<<fw8ag ==<<'),
  },
};

const plugin = promisify(
  domTransform({
    transforms: [
      (root, file, _info, done) => {
        const div = root.querySelector('div');

        if (div) {
          div.classList.add('added');
        }

        done();
      },
      (root, file, _info, done) => {
        const image = root.querySelector('img');
        if (image) {
          image.setAttribute('width', 100);
        }
        done();
      },
    ],
  }),
);

beforeAll(() => {
  const promise = plugin(files, {version: 'hi'});
  jest.runAllTimers();
  return promise;
});

describe('integration', () => {
  for (let file in files) {
    test(file, () => {
      expect(files[file].contents.toString()).toMatchSnapshot();
    });
  }
});

test('crashy transform', () => {
  const crashy = promisify(
    domTransform({
      transforms: [
        (root, file, _info, done) => {
          // Changes shouldn't take effect
          root.innerHTML = 'CRASH';
          done(new Error('Crash!'));
        },
      ],
    }),
  );

  // Mock out `console.error`
  /* eslint-disable no-console */
  const originalConsoleError = console.error;
  console.error = jest.fn(() => {});
  const singleFile = {
    'file.html': {
      contents: new Buffer('<p>Hello</p>'),
    },
  };

  const promise = crashy(singleFile, {}).then(() => {
    // Should have no changes.
    expect(singleFile['file.html'].contents.toString()).toMatchSnapshot();
    expect(console.error.mock.calls[0][0]).toMatchSnapshot();
    console.error = originalConsoleError;
  });

  jest.runAllTimers();

  return promise;
});

test('transformations execute serially', () => {
  const async = promisify(
    domTransform({
      transforms: [
        (root, file, _info, done) => {
          setTimeout(() => {
            root.firstChild.innerHTML = 'first';
            done();
          }, 200);
        },
        (root, file, _info, done) => {
          if (root.firstChild.innerHTML === 'first') {
            root.firstChild.innerHTML = 'second';
          }

          done();
        },
      ],
    }),
  );

  const singleFile = {
    'asyncfile.html': {
      contents: new Buffer('<p>To Be Replaced</p>'),
    },
  };

  const promise = async(singleFile, {}).then(() => {
    expect(singleFile['asyncfile.html'].contents.toString()).toBe('second');
  });

  jest.runAllTimers();

  return promise;
});
