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
import { DoctorDashboardPage } from "./pages/doctor/doctor-dashboard";
import { PatientLookupPage } from "./pages/doctor/patient-lookup";
import { PatientDetailPage } from "./pages/doctor/patient-detail";
import { PharmacyDashboardPage } from "./pages/pharmacy/pharmacy-dashboard";
import { PharmacyPrescriptionLookupPage } from "./pages/pharmacy/prescription-lookup";
import { PharmacyPrescriptionDetailPage } from "./pages/pharmacy/prescription-detail";

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
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <RootDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <OrgListPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs/create"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <OrgCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs/invite"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <OrgInvitePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/orgs/accept"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <InviteAcceptPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/patients/create"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <PatientCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/checklist"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <RootChecklistPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/medicines"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <MedicineListPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/medicines/create"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <MedicineCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/lab-tests"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <LabTestListPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/lab-tests/create"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <LabTestCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/root/lab-tests/measures"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]}>
              <LabMeasureCreatePage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]} allowOrg={["DOCTOR"]}>
              <DoctorDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]} allowOrg={["DOCTOR"]}>
              <PatientLookupPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]} allowOrg={["DOCTOR"]}>
              <PatientDetailPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]} allowOrg={["PHARMACIST"]}>
              <PharmacyDashboardPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/prescriptions"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]} allowOrg={["PHARMACIST"]}>
              <PharmacyPrescriptionLookupPage />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/prescriptions/:id"
        element={
          <ProtectedRoute>
            <RoleGuard allowGlobal={["ROOT_ADMIN"]} allowOrg={["PHARMACIST"]}>
              <PharmacyPrescriptionDetailPage />
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
