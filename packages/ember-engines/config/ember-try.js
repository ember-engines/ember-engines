"use strict";

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
        },
      },
      {
        name: "ember-lts-4.4",
        npm: {
          devDependencies: {
            "ember-source": "~4.4.0",
            "ember-cli": "~3.28.0",
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      {
        name: "ember-lts-4.8",
        npm: {
          devDependencies: {
            "ember-source": "~4.8.0",
            "ember-cli": "~3.28.0",
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      {
        name: "ember-lts-4.12",
        npm: {
          devDependencies: {
            "ember-source": "~4.12.0",
            "ember-cli": "~3.28.0",
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      {
        name: "ember-lts-5.4",
        npm: {
          devDependencies: {
            "ember-source": "^5.4.0",
            "ember-cli": "~3.28.0",
            "@ember/string": "*",
            "ember-engines-router-service": "*",
            "ember-resolver": "^11.0.1",
            "ember-export-application-global": null,
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      {
        name: "ember-release",
        npm: {
          devDependencies: {
            "ember-source": await getChannelURL("release"),
            "ember-cli": "~3.28.0",
            "@ember/string": "*",
            "ember-engines-router-service": "*",
            "ember-resolver": "^11.0.1",
            "ember-export-application-global": null,
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      {
        name: "ember-beta",
        npm: {
          devDependencies: {
            "ember-source": await getChannelURL("beta"),
            "ember-cli": "~3.28.0",
            "@ember/string": "*",
            "ember-engines-router-service": "*",
            "ember-resolver": "^11.0.1",
            "ember-export-application-global": null,
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      {
        name: "ember-canary",
        npm: {
          devDependencies: {
            "ember-source": await getChannelURL("canary"),
            "ember-cli": "~3.28.0",
            "@ember/string": "*",
            "ember-engines-router-service": "*",
            "ember-resolver": "^11.0.1",
            "ember-export-application-global": null,
            "ember-cli-app-version": "^5.0.0",
          }
        }
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
