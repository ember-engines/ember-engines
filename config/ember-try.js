/*jshint node:true*/
module.exports = {
  scenarios: [
    {
      name: 'ember-2.8',
      bower: {
        dependencies: {
          'ember': '~2.8.0'
        },
        resolutions: {
          'ember': '~2.8.0'
        }
      }
    },
    {
      name: 'ember-2.9',
      bower: {
        dependencies: {
          'ember': '~2.9.0-beta.2'
        },
        resolutions: {
          'ember': '~2.9.0-beta.2'
        }
      }
    },
    {
      name: 'ember-beta',
      bower: {
        dependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      }
    },
    {
      name: 'ember-canary',
      allowedToFail: true,
      bower: {
        dependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      }
    }
  ]
};
