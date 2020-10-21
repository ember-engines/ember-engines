'use strict';

const expect = require('chai').expect;
const ensureLazyLoadingHash = require('../../../lib/utils/ensure-lazy-loading-hash');

describe('ensureLazyLoadingHash', function () {

  it('returns a object with `enabled` key when lazyLoading is passed as boolean', function () {
    let lazyLoading = { lazyLoading: true };

    expect(ensureLazyLoadingHash(lazyLoading)).to.deep.equal({ lazyLoading: { enabled: true } });
  });

  it('returns a object with `enabled` key when lazyLoading is not passed', function () {
    let lazyLoading = {};

    expect(ensureLazyLoadingHash(lazyLoading)).to.deep.equal({ lazyLoading: { enabled: undefined } });
  });

  it('returns the same object if lazyLoading is passed as object', function () {
    let lazyLoading = { lazyLoading: { enabled: true } };

    expect(ensureLazyLoadingHash(lazyLoading)).to.deep.equal({ lazyLoading: { enabled: true } });
  });

});
