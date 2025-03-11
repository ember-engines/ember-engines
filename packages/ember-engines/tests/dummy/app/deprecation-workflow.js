import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    {
      handler: 'silence',
      matchId: 'ember-engines.addon-test-support.engine-resolver-for',
    },
    { handler: 'throw', matchId: 'template-action' },
    {
      handler: 'silence',
      matchId: 'ember-glimmer.link-to.positional-arguments',
    },
    {
      handler: 'silence',
      matchId: 'ember-engines.deprecation-router-service-from-host',
    },
  ],
});
