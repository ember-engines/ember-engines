'use strict';

const { name } = require('./package.json');
const EngineAddon = require('../../../../lib/engine-addon');

module.exports = EngineAddon.extend({
  name,
  lazyLoading: Object.freeze({
    enabled: true
  })
});
