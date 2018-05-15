import { VERSION } from '@ember/version'

// LAME, but ¯\_(ツ)_/¯
export default function hasEmberVersion(major, minor) {
  var numbers = VERSION.split('-')[0].split('.');
  var actualMajor = parseInt(numbers[0], 10);
  var actualMinor = parseInt(numbers[1], 10);
  return actualMajor > major || (actualMajor === major && actualMinor >= minor);
}

export const attributeMungingMethod = (function() {
  if (hasEmberVersion(2, 10)) {
    return 'didReceiveAttrs';
  } else {
    return `willRender`;
  }
})();
