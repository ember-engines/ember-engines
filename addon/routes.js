import emberRequire from './-private/ext-require';

const symbol = emberRequire('ember-metal/symbol');

export const ROUTES = symbol('ROUTES');

export default function buildRoutes(callback) {
  callback[ROUTES] = true;
  return callback;
}
