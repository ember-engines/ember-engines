'use strict';

/**
 * Creates a regex that matches the definition for the specified module name.
 *
 * @param {String} moduleName
 * @return {RegExp}
 */
function moduleMatcher(moduleName) {
  return new RegExp(`define\\(['"]${moduleName}['"]`);
}

/**
 * Creates a regex that matches the alias definition for the specified reexport.
 *
 * @param {String} moduleName
 * @param {String} alias
 * @return {RegExp}
 */
function reexportMatcher(moduleName, alias) {
  return new RegExp(`define.alias\\(['"]${moduleName}['"], ['"]${alias}['"]`);
}

/**
 * Creates a regex that matches a CSS comment with the specified content.
 *
 * @param {String} moduleName
 * @return {RegExp}
 */
function cssCommentMatcher(comment) {
  return new RegExp(`/\\* ${comment} \\*/`);
}

module.exports = {
  module: moduleMatcher,
  reexport: reexportMatcher,
  cssComment: cssCommentMatcher
};
