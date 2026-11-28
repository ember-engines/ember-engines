import Service from '@ember/service';

const STRINGS = { hello: 'Hello from ui-kit' };

let instances = 0;

export default class UiIntlService extends Service {
  instance = ++instances;

  t(key) {
    return STRINGS[key] ?? key;
  }
}
