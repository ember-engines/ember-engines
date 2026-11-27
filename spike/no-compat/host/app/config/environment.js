import { getGlobalConfig } from '@embroider/macros/src/addon/runtime';

const ENV = {
  modulePrefix: 'host',
  environment: import.meta.env.DEV ? 'development' : 'production',
  rootURL: import.meta.env.BASE_URL,
  locationType: 'history',
  EmberENV: {},
  APP: {},
};

export default ENV;

export function enterTestMode() {
  ENV.locationType = 'none';
  ENV.APP.rootElement = '#ember-testing';
  ENV.APP.autoboot = false;

  const config = getGlobalConfig()['@embroider/macros'];

  if (config) config.isTesting = true;
}
