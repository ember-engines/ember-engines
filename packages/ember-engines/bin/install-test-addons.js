/* eslint-env node */
'use strict';

const fs = require('fs-extra');

fs.removeSync('node_modules/common-components');
fs.symlinkSync(
  '../tests/dummy/lib/common-components',
  'node_modules/common-components',
);

fs.removeSync('node_modules/eager-blog');
fs.symlinkSync('../tests/dummy/lib/eager-blog', 'node_modules/eager-blog');

fs.removeSync('node_modules/ember-blog');
fs.symlinkSync('../tests/dummy/lib/ember-blog', 'node_modules/ember-blog');

fs.removeSync('node_modules/ember-chat');
fs.symlinkSync('../tests/dummy/lib/ember-chat', 'node_modules/ember-chat');
