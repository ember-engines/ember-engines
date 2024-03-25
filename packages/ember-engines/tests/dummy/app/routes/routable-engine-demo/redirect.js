import Route from '@ember/routing/route';

export default class RedirectRoute extends Route {
  redirect() {
    this.replaceWith('blog.post', 1, { queryParams: { lang: 'English' } });
  }
}
