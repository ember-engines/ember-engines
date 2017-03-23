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
  cssComment: cssCommentMatcher
};
