import emberRequire from './ext-require';

const symbol = emberRequire('ember-metal/symbol');

export const ENGINE_PARENT = symbol('ENGINE_PARENT');

export function getEngineParent(engine) {
  return engine[ENGINE_PARENT];
}

export function setEngineParent(engine, parent) {
  engine[ENGINE_PARENT] = parent;
}
