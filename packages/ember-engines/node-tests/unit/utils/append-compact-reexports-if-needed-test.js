'use strict';

const expect = require('chai').expect;
const appendCompactReexportsIfNeeded = require('../../../lib/utils/append-compact-reexports-if-needed');

describe('appendCompactReexportsIfNeeded', function() {
  const BABEL_COMPACT_REEXPORTS_PLUGIN = appendCompactReexportsIfNeeded.path;
  it('works', function() {
    expect(appendCompactReexportsIfNeeded([
    ])).to.eql([BABEL_COMPACT_REEXPORTS_PLUGIN]);

    expect(appendCompactReexportsIfNeeded([
      BABEL_COMPACT_REEXPORTS_PLUGIN
    ])).to.eql([BABEL_COMPACT_REEXPORTS_PLUGIN]);

    expect(appendCompactReexportsIfNeeded([
      BABEL_COMPACT_REEXPORTS_PLUGIN,
      BABEL_COMPACT_REEXPORTS_PLUGIN,
    ])).to.eql([
      BABEL_COMPACT_REEXPORTS_PLUGIN,
      BABEL_COMPACT_REEXPORTS_PLUGIN,
    ]);

    const foo = {};
    expect(appendCompactReexportsIfNeeded([
      'a',
      BABEL_COMPACT_REEXPORTS_PLUGIN,
      'b',
      BABEL_COMPACT_REEXPORTS_PLUGIN,
      'c',
      foo,
    ])).to.eql([
      'a',
      BABEL_COMPACT_REEXPORTS_PLUGIN,
      'b',
      BABEL_COMPACT_REEXPORTS_PLUGIN,
      'c',
      foo,
    ]);

    expect(appendCompactReexportsIfNeeded([
      'a',
      'b',
      'c',
      foo,
    ])).to.eql([
      'a',
      'b',
      'c',
      foo,
      BABEL_COMPACT_REEXPORTS_PLUGIN,
    ]);
  })
});
