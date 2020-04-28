var config;

try {
  var metaName = '{{MODULE_PREFIX}}/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  config = JSON.parse(unescape(rawConfig));
}
catch(err) {
  // in the case where there is no meta tag we can default to an empty pojo
  // instead of throwing an error
  config = {};
}

export default config;
