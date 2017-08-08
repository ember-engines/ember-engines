'use strict';

const stripIndent = require('common-tags').stripIndent;

module.exports = {
  addon: {
    'absolute-routes-import.js': `export default {};`,
    'relative-routes-import.js': `export default {};`,
    'routes.js': stripIndent`
      import buildRoutes from 'ember-engines/routes';
      import 'separate-routes/absolute-routes-import';
      import './relative-routes-import';

      export default buildRoutes(function() {
      });
    `,
  },
  'index.js': stripIndent`
    var EngineAddon = require('ember-engines/lib/engine-addon');
    module.exports = EngineAddon.extend({
      name: 'separate-routes',
      lazyLoading: {
        enabled: true,
        includeRoutesInApplication: false
      },

      isDevelopingAddon: function() {
        return true;
      }
    });
  `
};
