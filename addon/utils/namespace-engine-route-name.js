export function namespaceEngineRouteName(mountPoint, routeName) {
  if (routeName === 'application') {
    return mountPoint;
  } else {
    return `${mountPoint}.${routeName}`;
  }
}