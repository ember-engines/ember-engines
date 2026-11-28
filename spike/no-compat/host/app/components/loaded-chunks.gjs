import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';

// For the demo: which engines have loaded, and which scripts and stylesheets
// the browser fetched after the app's own code ran. Matching by name won't do:
// Rolldown also names a shared ember-source chunk "engine-*", and that one loads
// at boot. DOMContentLoaded won't do either: the app boots before it fires, and
// a deep link starts loading its engine before it does.
const bootedAt = performance.now();

export default class LoadedChunks extends Component {
  @service router;
  @tracked engines = [];
  @tracked files = [];

  constructor(owner, args) {
    super(owner, args);
    let update = () => this.update();
    this.router.on('routeDidChange', update);
    registerDestructor(this, () => this.router.off('routeDidChange', update));
    this.update();
  }

  update() {
    this.engines = [...(globalThis.__engineLoads ?? [])];
    this.files = performance
      .getEntriesByType('resource')
      .filter((entry) => entry.startTime > bootedAt)
      .map((entry) => new URL(entry.name).pathname.split('/').pop())
      .filter((name) => /\.(js|css)$/.test(name));
  }

  <template>
    <aside data-test-loaded-chunks>
      <h2>Loaded after boot</h2>
      <p>Engines: {{if this.engines.length this.engines "none yet"}}</p>
      <ul>
        {{#each this.files as |file|}}
          <li><code>{{file}}</code></li>
        {{/each}}
      </ul>
    </aside>
  </template>
}
