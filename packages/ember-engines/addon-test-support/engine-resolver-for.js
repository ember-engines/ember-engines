/* global require */
import EmberResolver from 'ember-resolver';
import { deprecate } from '@ember/debug';

/**
 * Gets the resolver class used by an Engine and creates an instance to be used
 * with test modules. Ex:
 *
 *   moduleForComponent('some-component', 'Integration Test', {
 *     resolver: engineResolverFor('ember-blog')
 *   });
 *
 * Uses the module found at `<engine-name>/resolver` as the class. If no module
 * exists at that path, then a default EmberResolver instance is created.
 *
 * You can optionally specify a modulePrefix in the event that the modulePrefix
 * differs from the engineName.
 *
 * You can optionally specify a podModulePrefix in the event that you're using
 * the pods structure.
 *
 * @method engineResolverFor
 * @param {String} engineName
 * @param {String} [modulePrefix]
 * @param {String} [podModulePrefix]
 * @return {Resolver}
 */
export default function engineResolverFor(
  engineName,
  modulePrefix = engineName,
  podModulePrefix = undefined
) {
  deprecate(
    "Use of `engineResolverFor` has been deprecated. Instead use `setupEngine(hooks, 'engine-name')` imported from `ember-engines/test-support` to load the engine you need.",
    false,
    {
      id: 'ember-engines.addon-test-support.engine-resolver-for',
      for: 'ember-engines',
      until: '1.0.0',
      since: {
        enabled: '0.8.23',
        available: '0.8.23',
      }
    });

  let Resolver;

  if (require.has(`${engineName}/resolver`)) {
    Resolver = require(`${engineName}/resolver`).default;
  } else {
    Resolver = EmberResolver;
  }
  return Resolver.create({ namespace: { modulePrefix, podModulePrefix } });
}
