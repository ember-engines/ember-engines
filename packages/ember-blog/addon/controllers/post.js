import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({
  queryParams: ['lang'],
  commentsRoute: 'post.comments', // Added to demonstrate that dynamic route names work

  actions: {
    transitionToHomeFromController() {
      this.transitionToExternalRoute('home').then(() => {
        set(this, 'transitionedToExternalRoute', true);
      });
    },
  }
});
