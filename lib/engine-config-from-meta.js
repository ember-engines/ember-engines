var config = {};
var metaElement = document.querySelector('meta[name="{{MODULE_PREFIX}}/config/environment"]');

if (metaElement) {
  try {
    config = JSON.parse(unescape(metaElement.getAttribute('content')));
  } catch (error) {
    throw new Error('Could not read config from meta tag for `{{MODULE_PREFIX}}` due to an error:\n' + error);
  }
}

export default config;