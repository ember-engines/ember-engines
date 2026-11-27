import { precompileTemplate } from '@ember/template-compilation';
import WidgetUser from '../components/widget-user.gjs';

// {{mount}} calls the engine's `template:application` as a template factory.
// Route templates may be components (a .gjs <template>); in Ember 7.3 a
// mounted engine's application template can't.
export default precompileTemplate(
  '<aside data-test-widget>Widget engine (routeless) for <WidgetUser /></aside>',
  { strictMode: true, scope: () => ({ WidgetUser }) },
);
