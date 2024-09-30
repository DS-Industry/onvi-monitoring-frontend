import React, { ReactNode } from "react";
import hasPermission from "./hasPermission";

interface CanProps {
  children: (allowed: boolean) => ReactNode;
  requiredPermissions: { object: string; action: string }[];
  userPermissions: { object: string; action: string }[];
}

const Can: React.FC<CanProps> = ({
  children,
  requiredPermissions,
  userPermissions,
}) => {
  const allowed = hasPermission(requiredPermissions, userPermissions);

  return <>{children(allowed)}</>;
};

export { Can };
