import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth/protected-route";
import { RoleGuard } from "./auth/role-guard";
import { AppLayout } from "./layouts/app-layout";
import { DashboardPage } from "./pages/dashboard";
import { HomePage } from "./pages/home";
import { LoginPage } from "./pages/login";
import { NotFoundPage } from "./pages/not-found";
import { RootChecklistPage } from "./pages/root/checklist";
import { RootDashboardPage } from "./pages/root/root-dashboard";
import { OrgCreatePage } from "./pages/root/org-create";
import { OrgInvitePage } from "./pages/root/org-invite";
import { OrgListPage } from "./pages/root/org-list";
import { InviteAcceptPage } from "./pages/root/invite-accept";
import { PatientCreatePage } from "./pages/root/patient-create";
import { MedicineListPage } from "./pages/root/medicine-list";
import { MedicineCreatePage } from "./pages/root/medicine-create";
import { LabTestListPage } from "./pages/root/lab-test-list";
import { LabTestCreatePage } from "./pages/root/lab-test-create";
import { LabMeasureCreatePage } from "./pages/root/lab-measure-create";

const App = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/root"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <RootDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <OrgListPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs/create"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <OrgCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs/invite"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <OrgInvitePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs/accept"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <InviteAcceptPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/patients/create"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <PatientCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/checklist"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <RootChecklistPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/medicines"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <MedicineListPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/medicines/create"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <MedicineCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/lab-tests"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <LabTestListPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/lab-tests/create"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <LabTestCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/lab-tests/measures"
        element={
          <ProtectedRoute>
            <RoleGuard allow={["ROOT_ADMIN"]}>
              <LabMeasureCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
