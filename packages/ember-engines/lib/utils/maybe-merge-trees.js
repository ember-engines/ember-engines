/* eslint-disable n/no-unpublished-require */
'use strict';

const mergeTrees = require('ember-cli/lib/broccoli/merge-trees');

let isEmptyTree = mergeTrees.isEmptyTree;

// To support version of ember-cli pre: v3.2.0-beta.1
if (typeof isEmptyTree !== 'function') {
  const EMPTY_TREE = mergeTrees([]);
  isEmptyTree = function (tree) {
    return EMPTY_TREE === tree;
  };
}

/*
  Small helper function to reduce extra effort when invoking
  `mergeTrees([])` or `mergeTrees([something])`.

  @param {Array} _inputTrees an array of potential trees to merge
  @return {Tree|undefined}
*/
module.exports = function maybeMergeTrees(inputTrees, options) {
  const tree = Array.isArray(inputTrees)
    ? mergeTrees(inputTrees, options)
    : inputTrees;

  if (isEmptyTree(tree)) {
    return undefined;
  } else {
    return tree;
  }
};
