import memoize from 'lodash-es/memoize'; // ✅ Better, but custom version is leaner

/**
 * Determines if the user has the required object-action permissions.
 * Uses memoization to cache results for performance optimization.
 *
 * @param requiredPermissions - Array of object-action pairs required for access.
 * @param userPermissions - Array of object-action pairs the user has.
 * @returns {boolean} - True if the user has at least one of the required permissions or if no required permissions are specified.
 */
const hasPermission = memoize(
  (
    requiredPermissions: { subject: string; action: string }[],
    userPermissions: { subject: string; action: string }[]
  ): boolean => {
    if (requiredPermissions.length === 0) return true;

    return requiredPermissions.some((required) =>
      userPermissions.some(
        (userPermission) =>
          userPermission.subject === required.subject &&
          userPermission.action === required.action
      )
    );
  },
  (requiredPermissions, userPermissions) =>
    JSON.stringify({ requiredPermissions, userPermissions })
);


export default hasPermission;
