import { deprecate } from '@ember/debug';

export function deprecateTransitionMethods(frameworkClass, methodName) {
  deprecate(
    `Calling ${methodName} on a ${frameworkClass} is deprecated. Use the RouterService provided by \`ember-engines-router-service\` instead.`,
    false,
    {
      id: 'ember-engines.transition-methods',
      for: 'ember-engines',
      since: {
        available: '0.10.0',
        enabled: '0.10.0',
      },
      until: '1.0.0',
      url: 'https://ember-engines.com/docs/deprecations#-transition-methods-of-controller-and-route',
    },
  );
}
