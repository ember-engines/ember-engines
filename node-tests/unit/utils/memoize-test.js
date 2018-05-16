'use strict';

const expect = require('chai').expect;
const memoize = require('../../../lib/utils/memoize');
const resetCaches = require('../../../lib/test-utils').resetCaches;

describe('memoize', function() {
  it('correctly memoizes functions', function() {
    const context = {
      pkg: {
        name: 'package-name'
      },

      calls: [],

      fn: memoize(function a() {
        this.calls.push([].slice.call(arguments));
        return 'cached value';
      })
    };

    context.fn(4, 8);
    expect(context.calls).to.deep.equal([
      [4, 8]
    ]);

    context.fn(15, 16);
    expect(context.calls).to.deep.equal([
      [4, 8]
    ]);

    // exercise the test utility to ensure that we can clean up after ourselves
    resetCaches();

    context.fn(23, 42);
    expect(context.calls).to.deep.equal([
      [4, 8],
      [23, 42],
    ]);
  });
});
