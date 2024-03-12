import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import MachineriesPage from "../machineries-map/pages/MachineriesPage";
import Home from "../home/Home";
import PageNotFound from "../page-not-found/PageNotFound";
import LoginPage from "../authentication/pages/LoginPage";
import { useContext } from "react";
import PrincipalContext from "../utils/contexts/PrincipalContext";
import MachineryPage from "../machinery/machinery/pages/MachineryPage";
import DocumentViewer from "../machinery/documents/components/DocumentViewer";
import DashboardsPage from "../dashboards/pages/DashboardsPage";
import DocumentsPage from "../documents/pages/DocumentsPage";
import UsersPage from "../users/pages/UsersPage";
import MachineryPermissionsPage from "../machinery-users/pages/MachineryPermissionsPage";
import permissionChecker from "../utils/PermissionChecker";
import CompaniesPage from "../companies/pages/CompaniesPage";
import UserAccount from "../users/components/UserAccount";
import MachineryManagementPage from "../machinery-management/pages/MachineryManagementPage";
import ResetPasswordPage from "../authentication/pages/ResetPasswordPage";
// import SignupPage from "../authentication/pages/SignupPage";

export default function Router() {
  const location = useLocation();
  const { principal } = useContext(PrincipalContext);

  const isArol = Number(principal?.companyID) === 0;
  const hasAnyDashboardAccess = permissionChecker.hasAnyDashboardAccess(principal!);
  const hasAnyDocumentsAccess = permissionChecker.hasAnyDocumentsAccess(principal!);
  const hasAnyMachineryAccess = permissionChecker.hasAnyMachineryAccess(principal!);

  function getRoute(path: string) {
    switch (path) {
      case "/": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (isArol) return <MachineriesPage />;
        return <Home />;
      }
      case "/login": {
        if (!principal) return <LoginPage />;
        else if (principal.isTemp) return <ResetPasswordPage />;
        return <Navigate to={"/"} />;
      }
      // case "/signup": {
      //   if (principal) return <Navigate to={"/"} />;
      //   return <SignupPage />;
      // }
      case "/my-account": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        return <UserAccount />;
      }
      case "/machineries": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        if (isArol) return <Navigate to={"/"} />;
        return <MachineriesPage />;
      }
      case "/machinery/:machineryUID": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        return <MachineryPage type={"landing"} />;
      }
      case "/machinery/:machineryUID/dashboard": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (!hasAnyDashboardAccess) return <Navigate to={"/"} />;
        return <MachineryPage type={"dashboard"} />;
      }
      case "/machinery/:machineryUID/documents": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (!hasAnyDocumentsAccess) return <Navigate to={"/"} />;
        return <MachineryPage type={"documents"} />;
      }
      case "/machinery/:machineryUID/sensors": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        if (!hasAnyMachineryAccess) return <Navigate to={"/"} />;
        return <MachineryPage type={"sensors"} />;
      }
      case "/machinery/:machineryUID/documents/:documentUID": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (!hasAnyDocumentsAccess) return <Navigate to={"/"} />;
        return <DocumentViewer />;
      }
      case "/users": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (permissionChecker.getRoleRank(principal!.roles) < permissionChecker.ROLE_MANAGER || isArol)
          return <Navigate to={"/"} />;
        return <UsersPage />;
      }
      case "/permissions": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (permissionChecker.getRoleRank(principal!.roles) < permissionChecker.ROLE_MANAGER || isArol)
          return <Navigate to={"/"} />;
        return <MachineryPermissionsPage />;
      }
      case "/dashboards": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (!hasAnyDashboardAccess || isArol) return <Navigate to={"/"} />;
        return <DashboardsPage />;
      }
      case "/documents": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (!hasAnyDocumentsAccess || isArol) return <Navigate to={"/"} />;
        return <DocumentsPage />;
      }
      case "/companies": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        else if (!isArol) return <Navigate to={"/"} />;
        return <CompaniesPage type={location.state} />;
      }
      case "/companies/:id": {
        if (!principal || principal.isTemp) return <Navigate to={"/login"} />;
        if (!isArol) return <Navigate to={"/"} />;
        else
          switch (location.state) {
            case "machinery_management":
              return <MachineryManagementPage />;
            case "machinery_permissions":
              if (permissionChecker.isArolSupervisorOrAbove(principal)) return <MachineryPermissionsPage />;
              return <Navigate to={"/"} />;
            case "company_management":
              if (permissionChecker.isArolSupervisorOrAbove(principal)) return <UsersPage />;
              return <Navigate to={"/"} />;
            default:
              return <Navigate to={"/"} />;
          }
      }
      default: {
        console.error("Unknown router path " + path);
        return <PageNotFound />;
      }
    }
  }

  return (
    <Routes>
      <Route path="/" element={getRoute("/")} />
      <Route path="/login" element={getRoute("/login")} />
      {/* <Route path="/signup" element={getRoute("/signup")} /> */}
      <Route path="/my-account" element={getRoute("/my-account")} />
      <Route path="/machineries" element={getRoute("/machineries")} />
      <Route path="/machinery/:machineryUID" element={getRoute("/machinery/:machineryUID")} />
      <Route path="/machinery/:machineryUID/dashboard" element={getRoute("/machinery/:machineryUID/dashboard")} />
      <Route path="/machinery/:machineryUID/documents" element={getRoute("/machinery/:machineryUID/documents")} />
      <Route path="/machinery/:machineryUID/sensors" element={getRoute("/machinery/:machineryUID/sensors")} />
      <Route
        path="/machinery/:machineryUID/documents/:documentUID"
        element={getRoute("/machinery/:machineryUID/documents/:documentUID")}
      />
      <Route path="/users" element={getRoute("/users")} />
      <Route path="/permissions" element={getRoute("/permissions")} />
      <Route path="/dashboards" element={getRoute("/dashboards")} />
      <Route path="/documents" element={getRoute("/documents")} />
      <Route path="/companies" element={getRoute("/companies")} />
      <Route path="/companies/:id" element={getRoute("/companies/:id")} />
      <Route path="/*" element={<PageNotFound />} />
    </Routes>
  );
}
