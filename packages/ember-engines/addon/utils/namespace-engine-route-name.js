/**
 * This method is responsible for return route name from engine namespace
 *
 * @public
 * @method namespaceEngineRouteName
 * @param {String} mountPoint
 * @param {String} routeName
 * @return {String}
 */
export function namespaceEngineRouteName(mountPoint, routeName) {
  if (routeName === 'application') {
    return mountPoint;
  } else {
    return `${mountPoint}.${routeName}`;
  }
}
