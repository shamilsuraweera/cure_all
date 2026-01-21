import React from "react";

import { useAuth } from "./auth-context";

type RoleGuardProps = {
  allow: string[];
  children: React.ReactNode;
};

export const RoleGuard = ({ allow, children }: RoleGuardProps) => {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return <div className="px-6 py-10 text-slate-600">Checking access...</div>;
  }

  if (!user || !allow.includes(user.globalRole)) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        You do not have access to this section.
      </div>
    );
  }

  return <>{children}</>;
};
