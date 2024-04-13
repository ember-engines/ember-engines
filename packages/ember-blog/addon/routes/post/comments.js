import Route from '@ember/routing/route';

export default class CommentsRoute extends Route {
  model() {
    return this.modelFor('post');
  }
}
