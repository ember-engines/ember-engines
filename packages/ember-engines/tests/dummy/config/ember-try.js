'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    command: 'ember test --filter="$ENGINESTESTFILTER"',
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-cli': '~3.28.0',
            'ember-source': '~3.28.0',
            'ember-qunit': '^5.1.5',
            '@ember/test-helpers': '^2.9.4',
            '@ember/test-waiters': '^3.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
            'ember-qunit': '^7.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
            'ember-qunit': '^7.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
            'ember-qunit': '^7.0.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
            'ember-qunit': '^7.0.0',
            'ember-engines-router-service': '*',
            'ember-resolver': '^11.0.1',
            'ember-export-application-global': null,
            'ember-cli-app-version': '^7.0.0',
          },
        },
      },
      {
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
            'ember-qunit': '^7.0.0',
            '@ember/string': '*',
            'ember-engines-router-service': '*',
            'ember-resolver': '^11.0.1',
            'ember-export-application-global': null,
          },
        },
      },
      {
        name: 'ember-lts-6.4',
        npm: {
          devDependencies: {
            'ember-source': '~6.4.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            'ember-engines-router-service': '*',
            'ember-export-application-global': null,
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            'ember-engines-router-service': '*',
            'ember-export-application-global': null,
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            'ember-engines-router-service': '*',
            'ember-export-application-global': null,
          },
        },
      },
    ],
  };
};
