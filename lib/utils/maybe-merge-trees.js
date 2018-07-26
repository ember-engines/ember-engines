'use strict';

const mergeTrees = require('ember-cli/lib/broccoli/merge-trees');

/*
  Small helper function to reduce extra effort when invoking
  `mergeTrees([])` or `mergeTrees([something])`.

  @param {Array} _inputTrees an array of potential trees to merge
  @return {Tree|undefined}
*/
module.exports = function maybeMergeTrees(inputTrees, options) {
  const tree = Array.isArray(inputTrees) ? mergeTrees(inputTrees, options) : inputTrees;

  if (mergeTrees.isEmptyTree(tree)) {
    return undefined;
  } else {
    return tree;
  }
};