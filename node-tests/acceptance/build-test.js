var path = require('path');
var chai = require('chai');
var chaiFiles = require('chai-files');
var compareBuild = require('../helpers/compare-build');

chai.use(chaiFiles);

var expect = chai.expect;
var file = chaiFiles.file;

describe('Acceptance', function() {
  describe('build', function() {
    this.timeout(300000);

    var build;

    beforeEach(function() {
      build = compareBuild();
    });

    afterEach(function() {
      build.cleanup();
    });

    it('correctly builds engine-testing application', function() {
      try {
        // Verify the diff of before/after is empty
        expect(build.diff.length).to.equal(0);
      } catch (e) {
        // If there is a diff, log it out to help debugging
        console.log('BUILD DIFF');
        console.log(build.diff);
        throw e;
      }
    });
  });
});
