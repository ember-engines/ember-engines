import { getEngineParent } from '@ember/engine';

// The application instance an engine instance is mounted in, through any
// engines in between.
export function rootOwner(owner) {
  let parent;
  while ((parent = getEngineParent(owner))) {
    owner = parent;
  }
  return owner;
}
