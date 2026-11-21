import React from "react";

import { LinkButton } from "../components/ui/button";
import { PageLoader } from "../components/ui/skeleton";
import { useAuth } from "./auth-context";

type RoleGuardProps = {
  allowGlobal?: string[];
  allowOrg?: string[];
  children: React.ReactNode;
};

export const RoleGuard = ({
  allowGlobal,
  allowOrg,
  children,
}: RoleGuardProps) => {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <PageLoader label="Checking access..." />;
  }

  const hasGlobalRole = allowGlobal?.includes(user?.globalRole ?? "") ?? false;
  const hasOrgRole =
    allowOrg?.some((role) => user?.orgRoles?.includes(role)) ?? false;

  if (!user || (!hasGlobalRole && !hasOrgRole)) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <p>You do not have access to this section.</p>
        <div className="mt-4">
          <LinkButton to="/dashboard" variant="outline">
            Back to dashboard
          </LinkButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
