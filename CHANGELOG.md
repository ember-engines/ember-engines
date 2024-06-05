# Changelog

## Release (2024-06-04)

ember-engines 0.11.0 (major)

#### :boom: Breaking Change
* `ember-blog`, `ember-engines`
  * [#855](https://github.com/ember-engines/ember-engines/pull/855) Enable Ember.js v5 compatibility and add embroider to try scenarios ([@void-mAlex](https://github.com/void-mAlex))
  * [#855](https://github.com/ember-engines/ember-engines/pull/855) Remove deprecated transition methods of controller and route per RFC #674 ([@void-mAlex](https://github.com/void-mAlex))

#### Committers: 1
- Alex ([@void-mAlex](https://github.com/void-mAlex))

## Release (2024-04-29)

ember-engines 0.10.0 (major)

#### :boom: Breaking Change
* `ember-engines`
  * [#878](https://github.com/ember-engines/ember-engines/pull/878) Drop support for Ember.js < 3.28 ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#870](https://github.com/ember-engines/ember-engines/pull/870) Drop support for Ember.js < 3.28 ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#859](https://github.com/ember-engines/ember-engines/pull/859) Drop support for Node.js v14 ([@SergeAstapov](https://github.com/SergeAstapov))

#### :rocket: Enhancement
* `ember-engines`
  * [#888](https://github.com/ember-engines/ember-engines/pull/888) [DEPRECATION] Deprecate transition methods of controller and route per RFC #674 ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#849](https://github.com/ember-engines/ember-engines/pull/849) update ember-source peer dependency to include released version 5 ([@void-mAlex](https://github.com/void-mAlex))
  * [#846](https://github.com/ember-engines/ember-engines/pull/846) enforce no app re-exports for engines ([@void-mAlex](https://github.com/void-mAlex))

#### :bug: Bug Fix
* `ember-engines`
  * [#876](https://github.com/ember-engines/ember-engines/pull/876) Ensure that the engine is destroyed in tests when the test context is cleaned up. ([@brettburley](https://github.com/brettburley))

#### :memo: Documentation
* `ember-engines`
  * [#879](https://github.com/ember-engines/ember-engines/pull/879) Update README.md with note about ember.js version support ([@SergeAstapov](https://github.com/SergeAstapov))

#### :house: Internal
* Other
  * [#891](https://github.com/ember-engines/ember-engines/pull/891) store secret in environment for added layer of security ([@void-mAlex](https://github.com/void-mAlex))
  * [#872](https://github.com/ember-engines/ember-engines/pull/872) Setup release-plan ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#873](https://github.com/ember-engines/ember-engines/pull/873) run npm init release-plan-setup@latest ([@mansona](https://github.com/mansona))
  * [#866](https://github.com/ember-engines/ember-engines/pull/866) Bump follow-redirects from 1.15.5 to 1.15.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#862](https://github.com/ember-engines/ember-engines/pull/862) Bump follow-redirects from 1.15.2 to 1.15.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#845](https://github.com/ember-engines/ember-engines/pull/845) Bump vm2 from 3.9.11 to 3.9.18 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#838](https://github.com/ember-engines/ember-engines/pull/838) Bump @xmldom/xmldom from 0.7.5 to 0.7.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#837](https://github.com/ember-engines/ember-engines/pull/837) Bump minimist from 0.2.1 to 0.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#832](https://github.com/ember-engines/ember-engines/pull/832) Bump decode-uri-component from 0.2.0 to 0.2.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#834](https://github.com/ember-engines/ember-engines/pull/834) Bump express from 4.17.2 to 4.18.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#831](https://github.com/ember-engines/ember-engines/pull/831) Bump loader-utils from 1.4.1 to 1.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
* `ember-engines`
  * [#889](https://github.com/ember-engines/ember-engines/pull/889) Add config for release plan ([@void-mAlex](https://github.com/void-mAlex))
  * [#886](https://github.com/ember-engines/ember-engines/pull/886) Use same ESLint setup for /lib folder ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#885](https://github.com/ember-engines/ember-engines/pull/885) run `npx ember-cli-update --to=5.7.0` to align with blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#884](https://github.com/ember-engines/ember-engines/pull/884) Bump eslint-plugin-qunit to v8 and fix errors ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#882](https://github.com/ember-engines/ember-engines/pull/882) Bump node tests related packages ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#881](https://github.com/ember-engines/ember-engines/pull/881) Replace ember-sinon with ember-sinon-qunit ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#880](https://github.com/ember-engines/ember-engines/pull/880) Update lint infra and fix errors ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#869](https://github.com/ember-engines/ember-engines/pull/869) Add more LTS version to CI matrix ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#863](https://github.com/ember-engines/ember-engines/pull/863) Sync addon setup with latest blueprint ([@SergeAstapov](https://github.com/SergeAstapov))
  * [#840](https://github.com/ember-engines/ember-engines/pull/840) Bump webpack from 5.68.0 to 5.76.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
* `common-components`, `ember-blog`, `ember-chat`, `ember-engines`
  * [#871](https://github.com/ember-engines/ember-engines/pull/871) Colocate component templates ([@SergeAstapov](https://github.com/SergeAstapov))
* `common-components`, `eager-blog`, `ember-blog`, `ember-chat`, `ember-engines`
  * [#868](https://github.com/ember-engines/ember-engines/pull/868) Convert codebase to use native classes ([@SergeAstapov](https://github.com/SergeAstapov))
* `ember-blog`, `ember-chat`, `ember-engines`
  * [#867](https://github.com/ember-engines/ember-engines/pull/867) Switch package manager to pnpm ([@void-mAlex](https://github.com/void-mAlex))

#### Committers: 4
- Alex ([@void-mAlex](https://github.com/void-mAlex))
- Brett Burley ([@brettburley](https://github.com/brettburley))
- Chris Manson ([@mansona](https://github.com/mansona))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))





## v0.9.0 (2022-11-17)

#### :boom: Breaking Change

* [#825](https://github.com/ember-engines/ember-engines/pull/825) Drop support for Ember < 3.24.1 and importing from 'ember-engines/com… ([@SergeAstapov](https://github.com/SergeAstapov))
* [#824](https://github.com/ember-engines/ember-engines/pull/824) Drop support for camelized engine names in Engine Config ([@SergeAstapov](https://github.com/SergeAstapov))
* [#818](https://github.com/ember-engines/ember-engines/pull/818) Drop unsupported Node.js versions < 14 ([@SergeAstapov](https://github.com/SergeAstapov))

#### :rocket: Enhancement

* [#827](https://github.com/ember-engines/ember-engines/pull/827) Make @ember/legacy-built-in-components optional peer dependency ([@SergeAstapov](https://github.com/SergeAstapov))
* [#808](https://github.com/ember-engines/ember-engines/pull/808) Move broccoli-test-helper to devDependencies ([@ginomiglio](https://github.com/ginomiglio))

#### :house: Internal

* [#828](https://github.com/ember-engines/ember-engines/pull/828) Update .npmignore to add few entries ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 5
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Gino ([@ginomiglio](https://github.com/ginomiglio))
- Matthew Irish ([@meirish](https://github.com/meirish))
- Michael Villander ([@villander](https://github.com/villander))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

## v0.8.23 (2022-07-28)

#### :rocket: Enhancement
* `ember-blog`, `ember-engines`
  * [#653](https://github.com/ember-engines/ember-engines/pull/653) Improve Test API for Engines ([@villander](https://github.com/villander))

#### Committers: 2
- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Michael Villander ([@villander](https://github.com/villander))

## v0.8.22 (2022-04-28)

#### :rocket: Enhancement
* `eager-blog`, `ember-blog`, `ember-chat`, `ember-engines`
  * [#798](https://github.com/ember-engines/ember-engines/pull/798) Ember 4 compatibility ([@BobrImperator](https://github.com/BobrImperator))

#### Committers: 1
- Bartlomiej Dudzik ([@BobrImperator](https://github.com/BobrImperator))


## v0.8.21 (2022-04-28)

#### :bug: Bug Fix
* `ember-engines`
  * [#804](https://github.com/ember-engines/ember-engines/pull/804) Add exclude list to addon dedupe logic ([@nlfurniss](https://github.com/nlfurniss))
  * [#794](https://github.com/ember-engines/ember-engines/pull/794) Fix usage of dependencySatisfies with a peerDependency ([@anehx](https://github.com/anehx))

#### :house: Internal
* `eager-blog`, `ember-engines`
  * [#797](https://github.com/ember-engines/ember-engines/pull/797) Update to ember qunit 5 ([@BobrImperator](https://github.com/BobrImperator))

#### Committers: 3
- Bartlomiej Dudzik ([@BobrImperator](https://github.com/BobrImperator))
- Jonas Metzener ([@anehx](https://github.com/anehx))
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))


## v0.8.20 (2021-10-04)

#### :bug: Bug Fix
* `ember-engines`
  * [#783](https://github.com/ember-engines/ember-engines/pull/783) [BUGFIX] Fallback to LinkTo behavior when outside an engine ([@elwayman02](https://github.com/elwayman02))

#### Committers: 1
- Jordan Hawker ([@elwayman02](https://github.com/elwayman02))


## v0.8.19 (2021-08-09)

#### :bug: Bug Fix
* `ember-engines`
  * [#785](https://github.com/ember-engines/ember-engines/pull/785) Bump @embroider/macros 0.43.5 ([@thoov](https://github.com/thoov))

#### :memo: Documentation
* `ember-engines`
  * [#778](https://github.com/ember-engines/ember-engines/pull/778) [DOC] Update Contributing Section and date info ([@villander](https://github.com/villander))

#### Committers: 2
- Michael Villander ([@villander](https://github.com/villander))
- Travis Hoover ([@thoov](https://github.com/thoov))


## v0.8.18 (2021-07-13)

#### :bug: Bug Fix
* `ember-engines`
  * [#782](https://github.com/ember-engines/ember-engines/pull/782) Bump to `@embroider/macros@0.43.0` to fix parallelization with production builds ([@thoov](https://github.com/thoov))

#### Committers: 1
- Travis Hoover ([@thoov](https://github.com/thoov))


## v0.8.17 (2021-07-01)

#### :rocket: Enhancement
* `ember-engines`
  * [#780](https://github.com/ember-engines/ember-engines/pull/780) Improve Embroider compatibility by bringing back `@embroider/macros` usage (instead of `ember-compatibility-helpers`) ([@thoov](https://github.com/thoov))

#### Committers: 1
- Travis Hoover ([@thoov](https://github.com/thoov))


## v0.8.16 (2021-06-16)

#### :bug: Bug Fix
* `ember-engines`
  * [#777](https://github.com/ember-engines/ember-engines/pull/777) Fix Embroider builds when using Ember older than 3.24 ([@thoov](https://github.com/thoov))
  * [#775](https://github.com/ember-engines/ember-engines/pull/775) Fix blueprint to routeless in-repo-engine ([@villander](https://github.com/villander))

#### :memo: Documentation
* `ember-engines`
  * [#764](https://github.com/ember-engines/ember-engines/pull/764) Add deprecation warning to router service from host ([@villander](https://github.com/villander))

#### :house: Internal
* `ember-engines`
  * [#760](https://github.com/ember-engines/ember-engines/pull/760) Octanify dummy templates ([@bertdeblock](https://github.com/bertdeblock))

#### Committers: 4
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Michael Villander ([@villander](https://github.com/villander))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Travis Hoover ([@thoov](https://github.com/thoov))


## v0.8.15 (2021-05-18)

#### :rocket: Enhancement
* `ember-engines`
  * [#769](https://github.com/ember-engines/ember-engines/pull/769) Support addon bundle caching as part of `ancestorHostAddons` ([@brendenpalmer](https://github.com/brendenpalmer))

#### Committers: 1
- Brenden Palmer ([@brendenpalmer](https://github.com/brendenpalmer))


## v0.8.14 (2021-04-28)

#### :bug: Bug Fix
* `ember-engines`
  * [#761](https://github.com/ember-engines/ember-engines/pull/761) [BUGFIX LTS] override assertLinkToOrigin method to noop in ember-engines ([@hmajoros](https://github.com/hmajoros))

#### Committers: 1
- Hank Majoros ([@hmajoros](https://github.com/hmajoros))


## v0.8.13 (2021-04-14)

#### :rocket: Enhancement
* `ember-engines`
  * [#759](https://github.com/ember-engines/ember-engines/pull/759) Support non-camelized engine names (deprecate camelization) ([@bertdeblock](https://github.com/bertdeblock))
  * [#758](https://github.com/ember-engines/ember-engines/pull/758) Expose a `buildEngine` function (avoid the appearance of being an `Ember.Object`) ([@bertdeblock](https://github.com/bertdeblock))

#### :bug: Bug Fix
* `ember-engines`
  * [#766](https://github.com/ember-engines/ember-engines/pull/766) Update `broccoli-concat` to address a major issue with cache invalidation ([@brendenpalmer](https://github.com/brendenpalmer))

#### Committers: 2
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Brenden Palmer ([@brendenpalmer](https://github.com/brendenpalmer))


## v0.8.12 (2021-01-29)

#### :bug: Bug Fix
* `ember-engines`
  * [#750](https://github.com/ember-engines/ember-engines/pull/750) Compute LCA host for engines ([@brendenpalmer](https://github.com/brendenpalmer))

#### :house: Internal
* `ember-engines`
  * [#751](https://github.com/ember-engines/ember-engines/pull/751) Ensure ember-engines are parallelizable. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Brenden Palmer ([@brendenpalmer](https://github.com/brendenpalmer))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v0.8.11 (2021-01-29)

#### :bug: Bug Fix
* `ember-engines`
  * [#752](https://github.com/ember-engines/ember-engines/pull/752) Revert usage of `@embroider/macros` ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v0.8.10 (2021-01-14)

#### :rocket: Enhancement
* `ember-engines`
  * [#744](https://github.com/ember-engines/ember-engines/pull/744) Remove custom `<LinkTo />` override with Ember >= 3.24.1. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* `ember-engines`
  * [#745](https://github.com/ember-engines/ember-engines/pull/745) Update the default ember-source version to 3.24.1. ([@rwjblue](https://github.com/rwjblue))
  * [#743](https://github.com/ember-engines/ember-engines/pull/743) Remove ember-compatibility-helpers. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v0.8.9 (2021-01-14)

#### :bug: Bug Fix
* `ember-engines`
  * [#742](https://github.com/ember-engines/ember-engines/pull/742) Fix compatibility with Ember 3.24+ ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#741](https://github.com/ember-engines/ember-engines/pull/741) Migrate to GitHub Actions for CI. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v0.8.8 (2020-10-22)

#### :bug: Bug Fix
* `ember-blog`, `ember-engines`
  * [#735](https://github.com/ember-engines/ember-engines/pull/735) Add mount prefix to route via computed instead of set ([@elwayman02](https://github.com/elwayman02))
* `ember-engines`
  * [#734](https://github.com/ember-engines/ember-engines/pull/734) fix: findHost and findHostHost should allow undefined lazyLoading config ([@xg-wang](https://github.com/xg-wang))

#### Committers: 2
- Jordan Hawker ([@elwayman02](https://github.com/elwayman02))
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))


## v0.8.7 (2020-10-09)

#### :rocket: Enhancement
* `ember-engines`
  * [#730](https://github.com/ember-engines/ember-engines/pull/730) Upgrade ember-cli-htmlbars to v5 ([@nlfurniss](https://github.com/nlfurniss))

#### :house: Internal
* `ember-engines`
  * [#731](https://github.com/ember-engines/ember-engines/pull/731) Add release automation. ([@rwjblue](https://github.com/rwjblue))
  * [#729](https://github.com/ember-engines/ember-engines/pull/729) Re-enable routeless engine container cleanup test. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Nathaniel Furniss ([@nlfurniss](https://github.com/nlfurniss))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v0.8.6 (2020-08-14)

#### :rocket: Enhancement

- [#716](https://github.com/ember-engines/ember-engines/pull/716) Add pods structure support for tests ([@nadavshatz](https://github.com/nadavshatz))
- [#697](https://github.com/ember-engines/ember-engines/pull/697) Add transitionToExternalRoute to controllers ([@villander](https://github.com/villander))

#### :memo: Documentation

- [#706](https://github.com/ember-engines/ember-engines/pull/706) [DOC] Update & Simplify informations ([@villander](https://github.com/villander))

#### :house: Internal

- [#719](https://github.com/ember-engines/ember-engines/pull/719) Convert project to use yarn workspaces ([@dgeb](https://github.com/dgeb))
- [#698](https://github.com/ember-engines/ember-engines/pull/698) Update project to ember-cli 3.17.0 ([@villander](https://github.com/villander))
- [#695](https://github.com/ember-engines/ember-engines/pull/695) travis ci config fix ([@bartocc](https://github.com/bartocc))

#### Committers: 4

- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Julien Palmas ([@bartocc](https://github.com/bartocc))
- Michael Villander ([@villander](https://github.com/villander))
- Nadav Shatz ([@nadavshatz](https://github.com/nadavshatz))

## v0.8.5 (2019-12-10)

#### :rocket: Enhancement

- [#686](https://github.com/ember-engines/ember-engines/pull/686) Req. compileModules:true to use compact-reexports ([@tmquinn](https://github.com/tmquinn))

#### Committers: 1

- Quinn Hoyer ([@tmquinn](https://github.com/tmquinn))

## v0.8.4 (2019-12-10)

#### :rocket: Enhancement

- [#686](https://github.com/ember-engines/ember-engines/pull/686) Req. compileModules:true to use compact-reexports ([@tmquinn](https://github.com/tmquinn))

#### Committers: 1

- Quinn Hoyer ([@tmquinn](https://github.com/tmquinn))

## v0.8.3 (2019-11-27)

#### :rocket: Enhancement

- [#679](https://github.com/ember-engines/ember-engines/pull/679) [namespacing] update link-to-external-component to be called link-to-external so references to it are not confused ([@gabrielcsapo](https://github.com/gabrielcsapo))

#### :memo: Documentation

- [#670](https://github.com/ember-engines/ember-engines/pull/670) Fix "Mounting" typo in README.md ([@camerondubas](https://github.com/camerondubas))

#### :house: Internal

- [#684](https://github.com/ember-engines/ember-engines/pull/684) Update dependencies ([@dgeb](https://github.com/dgeb))
- [#663](https://github.com/ember-engines/ember-engines/pull/663) Migrate Ember Tests to new API ([@villander](https://github.com/villander))

#### Committers: 4

- Cameron Dubas ([@camerondubas](https://github.com/camerondubas))
- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Gabriel Csapo ([@gabrielcsapo](https://github.com/gabrielcsapo))
- Michael Villander ([@villander](https://github.com/villander))

## v0.8.2 (2019-06-22)

#### :bug: Bug Fix

- [#666](https://github.com/ember-engines/ember-engines/pull/666) Use ember-asset-loader v0.6.1 at a minimum ([@ecoutlee-hortau](https://github.com/ecoutlee-hortau))

#### Committers: 1

- [@ecoutlee-hortau](https://github.com/ecoutlee-hortau)

## v0.8.1 (2019-06-21)

#### :bug: Bug Fix

- [#665](https://github.com/ember-engines/ember-engines/pull/665) Avoid shipping regenerator-runtime to production ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#661](https://github.com/ember-engines/ember-engines/pull/661) Update deps that were blocked on dropping Node 6. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2

- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v0.8.0 (2019-06-19)

#### :boom: Breaking Change

- [#659](https://github.com/ember-engines/ember-engines/pull/659) Drop support for Node 6 and 11. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement

- [#630](https://github.com/ember-engines/ember-engines/pull/630) Allow `app.import`ing from `node_modules` in lazy engines ([@villander](https://github.com/villander))

#### :bug: Bug Fix

- [#646](https://github.com/ember-engines/ember-engines/pull/646) Fix vendor tree usage inside a nested lazy loaded engine ([@2hu12](https://github.com/2hu12))

#### :memo: Documentation

- [#654](https://github.com/ember-engines/ember-engines/pull/654) Removes label `experimental` of ember-engines ([@villander](https://github.com/villander))

#### :house: Internal

- [#660](https://github.com/ember-engines/ember-engines/pull/660) Update ember-asset-loader to ^0.6.0 ([@villander](https://github.com/villander))
- [#658](https://github.com/ember-engines/ember-engines/pull/658) Update dependencies to latest versions. ([@rwjblue](https://github.com/rwjblue))
- [#657](https://github.com/ember-engines/ember-engines/pull/657) Add Ember 3.8 LTS to CI configuration. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 3

- 2hu ([@2hu12](https://github.com/2hu12))
- Michael Villander ([@villander](https://github.com/villander))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.7.2 (2019-06-18)

#### :bug: Bug Fix

- [#642](https://github.com/ember-engines/ember-engines/pull/642) Fix issues with `{{link-to}}` and `{{link-to-external}}` with Ember 3.10 ([@buschtoens](https://github.com/buschtoens))
- [#640](https://github.com/ember-engines/ember-engines/pull/640) Update blueprints to avoid linting errors with recent versions of eslint-plugin-ember ([@villander](https://github.com/villander))

#### :memo: Documentation

- [#641](https://github.com/ember-engines/ember-engines/pull/641) Update README with table of contents ([@villander](https://github.com/villander))
- [#650](https://github.com/ember-engines/ember-engines/pull/650) Update {{mount}} documentation to indicate a `model` named argument can be passed ([@garjust](https://github.com/garjust))

#### Committers: 3

- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))
- Justin Garbutt ([@garjust](https://github.com/garjust))
- Michael Villander ([@villander](https://github.com/villander))

## v0.7.1 (2019-05-11)

#### :rocket: Enhancement

- [#595](https://github.com/ember-engines/ember-engines/pull/595) Deduplicate addons in lazy engines that are nested dependencies of the engine (behind the EMBER_ENGINES_ADDON_DEDUPE environment flag ) ([@2hu12](https://github.com/2hu12))

#### Committers: 1

- 2hu ([@2hu12](https://github.com/2hu12))

## v0.7.0 (2019-04-01)

#### :boom: Breaking Change

- [#629](https://github.com/ember-engines/ember-engines/pull/629) Removes useDeprecatedIncorrectCSSProcessing ([@villander](https://github.com/villander))

#### Committers: 1

- Michael Villander ([@villander](https://github.com/villander))
-

## v0.6.3 (2019-03-26)

#### :bug: Bug Fix

- [#631](https://github.com/ember-engines/ember-engines/pull/631) Avoid errors when keywords array is not present. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1

- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v0.6.2 (2019-03-26)

#### :bug: Bug Fix

- [#588](https://github.com/ember-engines/ember-engines/pull/588) [Closes [#546](https://github.com/ember-engines/ember-engines/issues/546)] respects it’s host apps source-map config. ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1

- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## v0.6.1 (2019-03-12)

#### :rocket: Enhancement

- [#623](https://github.com/ember-engines/ember-engines/pull/623) upgrade ember-asset-loader ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1

- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## 0.6.0 (2019-03-12)

#### :boom: Breaking Change

- [#622](https://github.com/ember-engines/ember-engines/pull/622) Drop Node 4 support. ([@rwjblue](https://github.com/rwjblue))
- [#619](https://github.com/ember-engines/ember-engines/pull/619) Upgrade dependencies and addon blueprint to match ember-cli 3.8 ([@dgeb](https://github.com/dgeb))

#### :rocket: Enhancement

- [#605](https://github.com/ember-engines/ember-engines/pull/605) Issue warning when an engine does not have ember-addon and ember-engine keywords in package.json ([@villander](https://github.com/villander))

#### :bug: Bug Fix

- [#621](https://github.com/ember-engines/ember-engines/pull/621) fix(deps): move ember-try to devDependencies ([@dfreeman](https://github.com/dfreeman))
- [#615](https://github.com/ember-engines/ember-engines/pull/615) Fix typos ([@dgeb](https://github.com/dgeb))
- [#610](https://github.com/ember-engines/ember-engines/pull/610) Fix find-host utils with lazyLoading hash ([@villander](https://github.com/villander))

#### :house: Internal

- [#618](https://github.com/ember-engines/ember-engines/pull/618) Remove unnecessary file ([@astronomersiva](https://github.com/astronomersiva))
- [#612](https://github.com/ember-engines/ember-engines/pull/612) Add more to npmignore file. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 5

- Dan Freeman ([@dfreeman](https://github.com/dfreeman))
- Dan Gebhardt ([@dgeb](https://github.com/dgeb))
- Michael Villander ([@villander](https://github.com/villander))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Sivasubramanyam A ([@astronomersiva](https://github.com/astronomersiva))

## v0.5.26 (2019-01-14)

#### :bug: Bug Fix

- [#609](https://github.com/ember-engines/ember-engines/pull/609) fix(engine-addon): only call `_requireBuildPackages`, if it exists ([@buschtoens](https://github.com/buschtoens))
- [#607](https://github.com/ember-engines/ember-engines/pull/607) fix(route-ext): try `Route#_router` and `Route#router` ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1

- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))

## v0.5.25 (2018-12-21)

#### :bug: Bug Fix

- [#600](https://github.com/ember-engines/ember-engines/pull/600) fix(router-ext): hook into `getRoute`, if exsits ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1

- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))

## v0.5.24 (2018-10-09)

#### :bug: Bug Fix

- [#597](https://github.com/ember-engines/ember-engines/pull/597) Don’t accidentally re-include the compact reexport plugin more then once ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 1

- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## v0.5.23 (2018-10-04)

#### :rocket: Enhancement

- [#598](https://github.com/ember-engines/ember-engines/pull/598) Remove Usage of `Ember.Logger` ([@jherdman](https://github.com/jherdman))
- [#589](https://github.com/ember-engines/ember-engines/pull/589) Allow compact reexports with import as namespace. ([@stefanpenner](https://github.com/stefanpenner))

#### :bug: Bug Fix

- [#593](https://github.com/ember-engines/ember-engines/pull/593) Fix router setup ([@chadhietala](https://github.com/chadhietala))

#### :house: Internal

- [#591](https://github.com/ember-engines/ember-engines/pull/591) don’t troll with file://, which copies into node_modules causing sadn… ([@stefanpenner](https://github.com/stefanpenner))

#### Committers: 3

- Chad Hietala ([@chadhietala](https://github.com/chadhietala))
- James Herdman ([@jherdman](https://github.com/jherdman))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## v0.5.22 (2018-08-27)

#### :rocket: Enhancement

- [#586](https://github.com/ember-engines/ember-engines/pull/586) Ensure babel transpilation can be parallelized ([@arthirm](https://github.com/arthirm))

#### Committers: 1

- Arthi ([@arthirm](https://github.com/arthirm))
