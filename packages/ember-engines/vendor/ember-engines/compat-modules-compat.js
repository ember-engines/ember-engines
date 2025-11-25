globalThis.define?.('@embroider/virtual/compat-modules', () => {
  return {
    default: new Proxy(globalThis.requirejs.entries, {
      get(_, key) {
        if (globalThis.requirejs.entries[key]) {
          return globalThis.require(key);
        }
      },
    }),
  };
});
