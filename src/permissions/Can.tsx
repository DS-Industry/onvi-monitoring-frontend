import React, { ReactNode } from "react";
import hasPermission from "./hasPermission";

interface CanProps {
  children: (allowed: boolean) => ReactNode;
  requiredPermissions: { subject: string; action: string }[];
  userPermissions: { subject: string; action: string }[];
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
