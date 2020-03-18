import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  queryParams: ['lang'],
  router: service(),
  actions: {
    goHomeProgrammatically() {
      this.transitionToRouteExternal('home').then(() => {
        this.set('transitionedToRouteExternal', true);
      });
    },

    transitionToHomeByService() {
      this.router.transitionToExternal('home').then(() => {
        this.set('transitionToExternal', true);
      });
    },

    replaceWithHomeByService() {
      this.router.replaceWithExternal('home').then(() => {
        this.set('replaceWithExternal', true);
      });
    },

    copyPostURL() {
      const url = this.router.urlForExternal('home');
      this.set('urlForExternal', url);
      // Clipboard now has "/"
    },

    checkActiveState() {
      if (this.router.isActiveExternal('home')) {
        this.set('isActiveExternal', true);
      }
    }
  }
});
