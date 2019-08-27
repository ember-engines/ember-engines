import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['lang'],
  actions: {
    goHomeProgrammatically() {
      this.transitionToRouteExternal('home').then(() => {
        this.set('transitionedToExternal', true);
      });
    }
  }
});
