"use strict";

const getChannelURL = require("ember-source-channel-url");

module.exports = async function() {
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.1',
          }
        }
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          }
        }
      },
      {
        name: "ember-lts-4.4",
        npm: {
          devDependencies: {
            "ember-source": "^4.4.0-alpha.1",
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
      // The default `.travis.yml` runs this scenario via `npm test`,
      // not via `ember try`. It's still included here so that running
      // `ember try:each` manually or from a customized CI config will run it
      // along with all the other scenarios.
      {
        name: "ember-default",
        npm: {
          devDependencies: {}
        }
      },
      {
        name: "ember-default-with-jquery",
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            "jquery-integration": true
          })
        },
        npm: {
          devDependencies: {
            "@ember/jquery": "^0.5.1"
          }
        }
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false
          })
        },
        npm: {
          ember: {
            edition: 'classic'
          }
        }
      }
    ]
  };
};
