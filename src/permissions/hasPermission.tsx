import _ from "lodash";

/**
 * Determines if the user has the required object-action permissions.
 * Uses memoization to cache results for performance optimization.
 *
 * @param requiredPermissions - Array of object-action pairs required for access.
 * @param userPermissions - Array of object-action pairs the user has.
 * @returns {boolean} - True if the user has at least one of the required permissions or if no required permissions are specified.
 */
const hasPermission = _.memoize(
  (
    requiredPermissions: { subject: string; action: string }[],
    userPermissions: { subject: string; action: string }[]
  ): boolean => {
    // If no permissions are required, return true
    if (requiredPermissions.length === 0) {
      return true;
    }

    // Check if user has at least one required permission
    return requiredPermissions.every((required) =>
      userPermissions.some(
        (userPermission) =>
          userPermission.subject === required.subject &&
          userPermission.action === required.action
      )
    );
  }
);

export default hasPermission;
