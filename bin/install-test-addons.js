var fs = require('fs-extra');

fs.removeSync('node_modules/common-components');
fs.symlinkSync('../tests/dummy/lib/common-components', 'node_modules/common-components');

fs.removeSync('node_modules/eager-blog');
fs.symlinkSync('../tests/dummy/lib/eager-blog', 'node_modules/eager-blog');

fs.removeSync('node_modules/ember-blog');
fs.symlinkSync('../tests/dummy/lib/ember-blog', 'node_modules/ember-blog');

fs.removeSync('node_modules/ember-chat');
fs.symlinkSync('../tests/dummy/lib/ember-chat', 'node_modules/ember-chat');

fs.removeSync('node_modules/fails-loudly');
fs.symlinkSync('../tests/dummy/lib/fails-loudly', 'node_modules/fails-loudly');
