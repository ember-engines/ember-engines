'use strict';

const path = require('path');
const fs = require('fs-extra');
const stripIndent = require('common-tags').stripIndent;

module.exports = {
  addon: {
    styles: {
      'addon.css': `/* tree-invocation-order/addon/styles/addon.css */`,
      'circle.svg': stripIndent`
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="100"/>
        </svg>
      `,
      'other.css': `/* tree-invocation-order/addon/styles/other.css */`,
    },
    templates: {
      'application.hbs': stripIndent`
        tree-invocation-order/addon/templates/application.hbs
        {{outlet}}
      `,
    },
    'routes.js': stripIndent`
      import buildRoutes from 'ember-engines/routes';
      import importTarget from './tree-invocation-order-import-target';

      export default buildRoutes(function() {
        var result = importTarget;
        return result;
      });
    `,
    'tree-invocation-order-import-target.js': `export default {};`,
  },
  public: {
    'tree-invocation-order-public-asset.html': `tree-invocation-order/public/lazy-public-asset.html`,
  },
  vendor: {
    css: {
      'tree-invocation-order-appimport.css': `/* tree-invocation-order/vendor/css/appimport.css */`,
      'tree-invocation-order-thisimport.css': `/* tree-invocation-order/vendor/css/thisimport.css */`,
    },
    js: {
      'tree-invocation-order-appimport.js': `// tree-invocation-order/vendor/js/appimport.js`,
      'tree-invocation-order-thisimport.js': `// tree-invocation-order/vendor/js/thisimport.js`,
    },
  },
  // Since index.js is large and complicated, we keep it in a separate file
  'index.js': fs.readFileSync(path.join(__dirname, './index.js'), 'utf8'),
  'package.json': stripIndent`
    {
      "name": "tree-invocation-order",
      "keywords": [
        "ember-addon",
        "ember-engine"
      ],
      "dependencies": {
        "broccoli-funnel": "*",
        "broccoli-merge-trees": "*",
        "broccoli-stew": "*",
        "ember-cli-babel": "*",
        "ember-cli-htmlbars": "*"
      }
    }
  `,
};
