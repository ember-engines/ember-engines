'use strict';

const VersionChecker = require('ember-cli-version-checker');

// project cache that stores LCA hosts by lazy engine name
// eg, eventually this `WeakMap` will look like:
// {
//   projectAObj: {
//     testEngineName: Project|LazyEngineHost
//   }
// }
const wm = new WeakMap();

/**
 * Gets the level of the engine node or the total distance
 * from the root
 *
 * @name getDistanceFromRoot
 * @param {EngineAddon} engine The engine
 * @returns {number} The distance
 */
function getDistanceFromRoot(engine) {
  let distance = 0;
  let curr = engine;

  while (curr !== engine.project) {
    distance++;
    curr = curr.parent;
  }

  return distance;
}

/**
 * For a given engine, this finds the lowest common ancestor that is considered a
 * host amongst _all_ engines by the same name in the project.
 *
 * For example, given the following project addon structure:
 *
 *      --Project--
 *       /      \
 *      /        \
 * Lazy Engine A  \
 *              Addon A
 *                |
 *                |
 *           Lazy Engine B
 *            /          \
 *           /            \
 *      Lazy Engine A   Lazy Engine C
 *
 * - The LCA host for Lazy Engine A is the app
 * - The LCA host for Lazy Engine B is the app
 * - The LCA host for Lazy Engine C is Lazy Engine B
 *
 * Some context:
 *
 * The reason for this logic is that we want the host addons for deduplication
 * purposes to always be the same, no matter which lazy engine you encounter.
 * For instance, if we encounter Lazy Engine A at level 3 we wouldn't want its
 * actual hosts host to determine which addons to dedupe; you could run into
 * bugs whereby loading lazy engine A via the project won't actually load the
 * expected assets & its bundle was created based on deduplication from invalid
 * host addons.
 *
 * The way this is computed is:
 *
 * - Find all engines by the same name in the project
 * - Compute each of their levels (distances from root project)
 * - From the above levels, get the minimum level
 * - Bring all engines up to the same level (traverse up parent until all levels
 *   are equal)
 * - Check if the parent is strictly equal for all engines at this level and is
 *   considered a host; if this criteria is true return the parent (or the app for
 *   top-level project addons), otherwise traverse upward to the parent for each &
 *   try again
 *
 * @name findLCAHost
 * @param {AddonEngine} engine
 * @returns {Addon|Project}
 */
function findLCAHost(engine) {
  const { project, name: engineName } = engine;
  let cache = wm.get(project);

  if (!cache) {
    cache = new Map();
    wm.set(project, cache);
  }

  // only compute once for a given engine
  // we're using the engine name as the cache key here because regardless of its
  // version, lazy engines will always get output to: `engines-dist/${engineName}`
  const commonHost = cache.get(engineName);

  if (commonHost) {
    return commonHost;
  }

  const checker = VersionChecker.forProject(project);
  const allEngines = checker.filterAddonsByName(engineName);

  const levels = allEngines.map(currEngine => ({
    engine: currEngine,
    distance: getDistanceFromRoot(currEngine)
  }));

  const minLevel = levels.reduce(
    (acc, { distance }) => Math.min(acc, distance),
    Number.POSITIVE_INFINITY
  );

  let equivalentLevels = levels.map(
    ({ distance: currDistance, engine: currEngine }) => {
      while (currDistance > minLevel) {
        currEngine = currEngine.parent;
        currDistance--;
      }

      return currEngine;
    }
  );

  while (equivalentLevels[0].parent) {
    const parentToCheck = equivalentLevels[0].parent;

    const areAllParentsEqual = equivalentLevels.reduce((acc, curr) => {
      if (!acc) {
        return acc;
      }

      return curr.parent === parentToCheck;
    }, true);

    const isParentLazyEngine =
      parentToCheck &&
      parentToCheck.lazyLoading &&
      parentToCheck.lazyLoading.enabled === true;

    const isParentProject = parentToCheck === project;

    if (areAllParentsEqual) {
      if (isParentLazyEngine) {
        cache.set(engineName, parentToCheck);
        return parentToCheck;
      }

      // if the parent is the project, return the `app`
      if (isParentProject) {
        cache.set(engineName, equivalentLevels[0].app);
        return equivalentLevels[0].app;
      }
    }

    // traverse upwards for each engine/addon
    equivalentLevels = equivalentLevels.map(({ parent }) => parent);
  }

  // this should never be triggered
  throw new Error(
    `[ember-engines] Could not find a common host for: \`${engineName}\`; its locations are: \`${allEngines
      .map(engine => engine.root)
      .join(', ')}\``
  );
}

module.exports = { findLCAHost };
