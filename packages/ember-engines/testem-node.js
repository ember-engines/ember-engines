module.exports = {
  launchers: {
    Node: {
      command: 'npm run test:node',
      protocol: 'tap',
    },
  },
  src_files: ['lib/**/*.js', 'node-tests/**/*.js'],
  launch_in_ci: ['Node'],
  launch_in_dev: ['Node'],
};
