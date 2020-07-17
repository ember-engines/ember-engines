'use strict';

const matchers = require('./matchers');
const expect = require('chai').expect;

describe('matchers', function() {
  describe('module', function() {
    it('matches module definitions for the specified name', function() {
      const matcher = matchers.module('foo/component/bar-baz');

      const inputSingleQuotes =
        "define('foo/component/bar-baz', [], function(){});";
      expect(matcher.test(inputSingleQuotes)).to.be.true;

      const inputDoubleQuotes =
        'define("foo/component/bar-baz", [], function(){});';
      expect(matcher.test(inputDoubleQuotes)).to.be.true;
    });

    it('does not match for non-exact module names', function() {
      const input = 'define("foo/component/bar-baz", [], function(){});';

      const longerNameMatcher = matchers.module('foo/component/bar-bazy');
      expect(longerNameMatcher.test(input)).to.be.false;

      const shorterNameMatcher = matchers.module('foo/component/bar-ba');
      expect(shorterNameMatcher.test(input)).to.be.false;
    });
  });

  describe('reexport', function() {
    it('matches aliased module definitions', function() {
      const matcher = matchers.reexport(
        'foo/component/bar-baz',
        'app/component/bar-baz'
      );

      const inputSingleQuotes =
        "define.alias('foo/component/bar-baz', 'app/component/bar-baz');";
      expect(matcher.test(inputSingleQuotes)).to.be.true;

      const inputDoubleQuotes =
        'define.alias("foo/component/bar-baz", "app/component/bar-baz");';
      expect(matcher.test(inputDoubleQuotes)).to.be.true;
    });

    it('does not match improperly aliased module definitions', function() {
      const matcher = matchers.reexport(
        'foo/component/bar-baz',
        'app/component/bar-baz'
      );

      const inputReversedAlias =
        'define.alias("app/component/bar-baz", "foo/component/bar-baz");';
      expect(matcher.test(inputReversedAlias)).to.be.false;

      const inputOldAlias =
        'define("foo/component/bar-baz", define.alias("foo/component/bar-baz"));';
      expect(matcher.test(inputOldAlias)).to.be.false;
    });

    it('does not match normal module definitions', function() {
      const matcher = matchers.reexport(
        'foo/component/bar-baz',
        'app/component/bar-baz'
      );

      const input1 = 'define("foo/component/bar-baz", [] function(){});';
      expect(matcher.test(input1)).to.be.false;

      const input2 = 'define("app/component/bar-baz", [] function(){});';
      expect(matcher.test(input2)).to.be.false;
    });
  });

  describe('cssComment', function() {
    it('matches css comments', function() {
      const matcher = matchers.cssComment('some comment');
      const input = '/* some comment */';

      expect(matcher.test(input)).to.be.true;
    });

    it('does not match improperly formatted css comments', function() {
      const matcher = matchers.cssComment('some comment');

      const inputNoSpaces = '/*some comment*/';
      expect(matcher.test(inputNoSpaces)).to.be.false;

      const inputDoubleSlash = '// some comment';
      expect(matcher.test(inputDoubleSlash)).to.be.false;
    });
  });
});
