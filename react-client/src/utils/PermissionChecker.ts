import UserDetails from "../authentication/interfaces/UserDetails";
import User from "../users/interfaces/User";

/* ROLES and RANKS */

enum Role {
  WORKER = 1,
  OFFICER = 1,
  MANAGER = 2,
  SUPERVISOR = 2,
  ADMIN = 3,
  CHIEF = 3,
}

const ROLE_WORKER = Role.WORKER;
const ROLE_OFFICER = Role.OFFICER;
const ROLE_MANAGER = Role.MANAGER;
const ROLE_SUPERVISOR = Role.SUPERVISOR;
const ROLE_ADMIN = Role.ADMIN;
const ROLE_CHIEF = Role.CHIEF;

// FUNCTIONS TO CHECK PERMISSIONS
function hasMachineryPermission(
  principal: UserDetails | null | undefined,
  machineryUID: string,
  requiredPermission: string,
) {
  return (
    principal &&
    ((principal.permissions.hasOwnProperty(machineryUID) && principal.permissions[machineryUID][requiredPermission]) ||
      isAdmin(principal) ||
      isArolChief(principal))
  );
}

function hasMachineryAccess(principal: UserDetails | null | undefined, machineryUID: string) {
  return principal && (principal.permissions.hasOwnProperty(machineryUID) || isArolChief(principal));
}

function hasDashboardAccess(principal: UserDetails | null | undefined, machineryUID: string) {
  if (!principal) return false;

  if (isAdmin(principal) || isArolChief(principal)) return true;

  for (let [key, value] of Object.entries(principal.permissions)) {
    if (key.startsWith(machineryUID)) if (value["dashboardsRead"]) return true;
  }

  return false;
}

function hasDocumentsAccess(principal: UserDetails | null | undefined, machineryUID: string) {
  if (!principal) return false;

  if (isAdmin(principal) || isArolChief(principal)) return true;

  for (let [key, value] of Object.entries(principal.permissions)) {
    if (key.startsWith(machineryUID)) if (value["documentsRead"]) return true;
  }

  return false;
}

function hasAnyMachineryAccess(principal: UserDetails | null | undefined) {
  return principal && (Object.keys(principal.permissions).length > 0 || isAdmin(principal));
}

function hasAnyDashboardAccess(principal: UserDetails | null | undefined) {
  if (!principal) return false;

  if (isAdmin(principal) || isArolChief(principal)) return true;

  for (const permission of Object.values(principal.permissions)) if (permission["dashboardsRead"]) return true;

  return false;
}

function hasAnyDocumentsAccess(principal: UserDetails | null | undefined) {
  if (!principal) return false;

  if (isAdmin(principal) || isArolChief(principal)) return true;

  for (const permission of Object.values(principal.permissions)) if (permission["documentsRead"]) return true;

  return false;
}

function hasSidebarItemAccess(principal: UserDetails | null, sidebarItemName: string) {
  const isArol = Number(principal?.companyID) === 0;

  switch (sidebarItemName) {
    case "home":
      return true;
    case "machinery_management":
      return isArol;
    case "company_management":
      return isArolSupervisorOrAbove(principal);
    case "machinery_permissions":
      return isArolSupervisorOrAbove(principal);
    case "machineries":
      return !isArol;
    case "dashboards":
      return !isArol && hasAnyDashboardAccess(principal);
    case "documents":
      return !isArol && hasAnyDocumentsAccess(principal);
    case "users":
      return !isArol && isAdmin(principal);
    case "permissions":
      return !isArol && isManagerOrAbove(principal);
    default:
      return false;
  }
}

function getRoleRank(roles: string[] | undefined) {
  const roleRanks = {
    COMPANY_ROLE_WORKER: 1,
    AROL_ROLE_OFFICER: 1,
    COMPANY_ROLE_MANAGER: 2,
    AROL_ROLE_SUPERVISOR: 2,
    COMPANY_ROLE_ADMIN: 3,
    AROL_ROLE_CHIEF: 3,
  };

  let maxRank = 0;
  if (roles) {
    roles.forEach((role) => {
      const rank = roleRanks[role];
      if (rank && rank > maxRank) maxRank = rank;
    });
  }

  return maxRank;
}

function isAdmin(principal: UserDetails | User | null | undefined) {
  const roleRank = getRoleRank(principal?.roles);
  return roleRank !== null && roleRank === ROLE_ADMIN && Number(principal?.companyID) !== 0;
}

function isArolSupervisorOrAbove(principal: UserDetails | User | null | undefined): boolean {
  const roleRank = getRoleRank(principal?.roles);
  return (
    roleRank !== null && (roleRank === Role.CHIEF || roleRank === Role.SUPERVISOR) && Number(principal?.companyID) === 0
  );
}

function isArolChief(principal: UserDetails | User | null | undefined) {
  const roleRank = getRoleRank(principal?.roles);
  return roleRank !== null && roleRank === Role.CHIEF && Number(principal?.companyID) === 0;
}

function isManagerOrAbove(principal: UserDetails | User | null | undefined) {
  const roleRank = getRoleRank(principal?.roles);
  return (
    roleRank !== null && (roleRank >= ROLE_MANAGER || roleRank >= ROLE_SUPERVISOR) && Number(principal?.companyID) !== 0
  );
}

const PermissionChecker = {
  ROLE_WORKER,
  ROLE_OFFICER,
  ROLE_MANAGER,
  ROLE_SUPERVISOR,
  ROLE_ADMIN,
  ROLE_CHIEF,
  hasMachineryPermission,
  hasMachineryAccess,
  hasDashboardAccess,
  hasDocumentsAccess,
  hasAnyMachineryAccess,
  hasSidebarItemAccess,
  hasAnyDashboardAccess,
  hasAnyDocumentsAccess,
  getRoleRank,
  isAdmin,
  isManagerOrAbove,
  isArolSupervisorOrAbove,
  isArolChief,
};

export default PermissionChecker;
