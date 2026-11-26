'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'host-compat',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: { EXTEND_PROTOTYPES: false, FEATURES: {} },
    APP: {},
  };

  if (environment === 'test') {
    ENV.locationType = 'none';
    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
