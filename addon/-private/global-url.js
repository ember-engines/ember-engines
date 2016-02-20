function GlobalUrl(url) {
  this.url = url;
  this.isGlobalUrl = true;
}

GlobalUrl.prototype.toString = function() {
  return '' + this.url;
};

export default GlobalUrl;
