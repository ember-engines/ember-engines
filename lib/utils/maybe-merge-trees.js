'use strict';

const mergeTrees = require('ember-cli/lib/broccoli/merge-trees');

/*
  Small helper function to reduce extra effort when invoking
  `mergeTrees([])` or `mergeTrees([something])`.

  @param {Array} _inputTrees an array of potential trees to merge
  @return {Tree|undefined}
*/
module.exports = function maybeMergeTrees(_inputTrees, options) {
  let inputTrees = _inputTrees.filter(Boolean);
  if (inputTrees.length > 1) {
    let merged = mergeTrees(inputTrees, options);
    if (Array.isArray(merged._inputTrees) && merged._inputTrees.length === 0) {
      // return undefined, as `mergeTrees` here is returning a merge of nothing
      return;
    }
    return merged;
  } else {
    return inputTrees[0];
  }
};