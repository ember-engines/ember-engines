'use strict';

const expect = require('chai').expect;
const maybeMergeTrees = require('../../../lib/utils/maybe-merge-trees');

describe('maybeMergeTrees', function() {

  it('returns undefined "a merge of nothing" when passed an empty array', function() {
    let expected = undefined;

    let first = maybeMergeTrees([]);
    let second = maybeMergeTrees([]);

    expect(first).to.equal(expected);
    expect(second).to.equal(expected);
  });

  it('returns the first item when merging single item array', function() {
    let actual = maybeMergeTrees(['foo']);

    expect(actual).to.equal('foo');
  });

  it('return all inputTrees as single merged tree', function() {
    let expected = ['foo', 'bar'];

    let actual = maybeMergeTrees(['foo', 'bar'])._inputNodes;

    expect(actual).to.deep.equal(expected);
  });

});