import Route from '@ember/routing/route';

export default class AfterModelRoute extends Route {
  afterModel(model) {
    this.replaceWith('blog.post', model.id, {
      queryParams: { lang: 'English' }
    });
  }
}
