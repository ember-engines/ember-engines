const stripIndent = require('common-tags').stripIndent;

module.exports = {
  addon: {
    'absolute-routes-import.js': `export default {};`,
    'relative-routes-import.js': `export default {};`,
    'routes.js': stripIndent`
      import buildRoutes from 'ember-engines/routes';
      import 'routes-hoisting/absolute-routes-import';
      import './relative-routes-import';

      export default buildRoutes(function() {
      });
    `,
  }
};
