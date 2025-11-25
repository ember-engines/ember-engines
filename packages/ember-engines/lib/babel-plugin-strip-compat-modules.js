export default function stripCompatModules(babel) {
  const t = babel.types;
  return {
    pre(state) {
      if (state.opts.filename.includes('engine.js')) {
        babel.traverse(
          state.ast,
          {
            CallExpression(path) {
              if (
                path.node.callee.name === 'loadInitializers' &&
                path.node.arguments[2]?.name === 'compatModules'
              ) {
                path.node.arguments.length = 2;
              }
            },
            ClassProperty(path) {
              if (path.node.key.name === 'Resolver') {
                path.node.value = t.identifier('Resolver');
              }
            },
            ImportDeclaration(path) {
              if (
                path.node.source.value === '@embroider/virtual/compat-modules'
              ) {
                path.remove();
              }
            },
          },
          state.scope,
          this,
        );
      }
    },
  };
}
