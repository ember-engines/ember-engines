import Ember from 'ember';
import GlobalUrl from '../-private/global-url';

const {
  get,
  getOwner
} = Ember;


export default Ember.Helper.extend({
  compute(name) {
    let urlInfo = getOwner(this).lookup(`url:${name}`);
    let url = get(urlInfo, 'url');
    return new GlobalUrl(url);
  }
});
