import _ from "lodash";

/**
 * Determines if the user has the required object-action permissions.
 * Uses memoization to cache results for performance optimization.
 *
 * @param requiredPermissions - Array of object-action pairs required for access.
 * @param userPermissions - Array of object-action pairs the user has.
 * @returns {boolean} - True if the user has at least one of the required permissions, otherwise false.
 */
const hasPermission = _.memoize(
  (
    requiredPermissions: { object: string; action: string }[],
    userPermissions: { object: string; action: string }[]
  ): boolean => {
    return requiredPermissions.some((required) =>
      userPermissions.some(
        (userPermission) =>
          userPermission.object === required.object &&
          userPermission.action === required.action
      )
    );
  }
);

export default hasPermission;
