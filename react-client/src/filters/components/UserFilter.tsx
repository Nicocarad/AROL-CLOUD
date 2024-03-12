import React, { useState, useContext } from "react";
import {
  HStack,
  Box,
  Flex,
  Text,
  Stack,
  Checkbox,
  Input,
  FormControl,
  FormLabel,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import { MdDateRange, MdWork } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { HiOutlineStatusOnline } from "react-icons/hi";
import UserFilters from "../interfaces/UserFilters";
import ToastHelper from "../../utils/ToastHelper";
import ToastContext from "../../utils/contexts/ToastContext";
import RoleTranslator from "../../utils/RoleTranslator";
import dayjs from "dayjs";
import FilterButton from "./FilterButton";

const arolRoles = ["AROL_ROLE_CHIEF", "AROL_ROLE_SUPERVISOR", "AROL_ROLE_OFFICER"];
const companyRoles = ["COMPANY_ROLE_ADMIN", "COMPANY_ROLE_MANAGER", "COMPANY_ROLE_WORKER"];

interface UserFilterProps {
  companyID: number;
  setUserFilter: React.Dispatch<React.SetStateAction<UserFilters>>;
  onPopoverChange: (popoverId: string | null) => void;
}

export default function UserFilter(props: UserFilterProps) {
  const toast = useContext(ToastContext);

  const unsetRoles = (props.companyID === 0 ? arolRoles : companyRoles).reduce((acc, key) => {
    return { ...acc, [key]: null };
  }, {});

  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [startDate, setStartDate] = useState<string>("");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");

  const [roles, setRoles] = useState<{ [key: string]: boolean }>(unsetRoles);
  const [selectedRoles, setSelectedRoles] = useState<{
    [key: string]: boolean;
  }>({});
  const [checkedRoles, setCheckedRoles] = useState<{ [key: string]: boolean }>(unsetRoles);

  const StatusRadio = ({ handleStatusChange }) => {
    return (
      <HStack>
        {["ACTIVE", "DISABLED"].map((value) => (
          <Box as="label" key={value}>
            <Box
              cursor="pointer"
              borderWidth="2px"
              borderRadius="md"
              borderColor={status === value ? "teal.600" : "gray.200"}
              bg={status === value ? "teal.600" : "white"}
              color={status === value ? "white" : "black"}
              fontWeight={"semibold"}
              px={5}
              py={3}
            >
              <input
                type="radio"
                value={value}
                checked={status === value}
                onChange={(event) => handleStatusChange(event.target.value)}
                style={{ display: "none" }}
              />
              {value}
            </Box>
          </Box>
        ))}
      </HStack>
    );
  };

  const DateRangePicker = ({ handleDateChange }) => {
    return (
      <Box>
        <Flex direction="row" justifyContent="space-between" gap={4}>
          <FormControl>
            <FormLabel>After</FormLabel>
            <Input
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
              value={startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Before</FormLabel>
            <Input
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().split("T")[0]}
              value={endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
            />
          </FormControl>
        </Flex>
      </Box>
    );
  };

  const RolesCheckbox = ({ handleRolesChange }) => {
    return (
      <Stack spacing={2} mr={5} ml={5}>
        {Object.entries(checkedRoles).map(([role]) => (
          <Checkbox
            key={role}
            defaultChecked={checkedRoles[role]}
            onChange={() => {
              setCheckedRoles((prevCheckedRoles) => {
                const updatedRoles = {
                  ...prevCheckedRoles,
                  [role]: !prevCheckedRoles[role],
                };
                handleRolesChange(updatedRoles);
                return updatedRoles;
              });
            }}
          >
            {RoleTranslator.translateRoles([role]).split(" ")[0]}
          </Checkbox>
        ))}
      </Stack>
    );
  };

  const handleFilterChange = (filterType: string, value: any) => {
    switch (filterType) {
      case "status":
        setStatus(value);
        break;
      case "roles":
        setRoles(value);
        break;
      case "startDate":
        setStartDate(value);
        break;
      case "endDate":
        setEndDate(value);
        break;
      default:
        ToastHelper.makeToast(toast, "Filter not applied", "warning");
        break;
    }
  };

  const handleSave = (filterType: string) => {
    let updatedFilter = {};

    switch (filterType) {
      case "status":
        updatedFilter = { status };
        if (!status) {
          ToastHelper.makeToast(toast, "No status selected", "warning");
          return;
        }
        setSelectedStatus(status);
        break;
      case "role":
        updatedFilter = { roles };
        if (!Object.values(roles).some((role) => role)) {
          ToastHelper.makeToast(toast, "No role selected", "warning");
          return;
        }
        setSelectedRoles(roles);
        break;
      case "creationDate":
        if (dayjs(startDate).isAfter(dayjs(endDate))) {
          ToastHelper.makeToast(toast, "Start date must be before end date", "warning");
          handleReset("creationDate");
          return;
        }
        if (!startDate && !endDate) {
          ToastHelper.makeToast(toast, "No date selected", "warning");
          return;
        }
        updatedFilter = { creationDate: { startDate, endDate } };
        setSelectedStartDate(startDate);
        setSelectedEndDate(endDate);
        break;
      default:
        ToastHelper.makeToast(toast, "Filter not applied", "warning");
        return;
    }

    ToastHelper.makeToast(toast, "Filter applied", "success");

    props.setUserFilter!((prevFilter) => ({
      ...prevFilter,
      ...updatedFilter,
    }));

    setOpenPopover(null);
  };

  const handleReset = (filterType: string) => {
    let clearedFilter = {};

    switch (filterType) {
      case "status":
        clearedFilter = { status: "" };
        if (!status) {
          ToastHelper.makeToast(toast, "No status selected", "warning");
          return;
        }
        setStatus("");
        setSelectedStatus("");
        break;
      case "role":
        clearedFilter = { roles: null };
        if (!Object.values(roles).some((role) => role)) {
          ToastHelper.makeToast(toast, "No role selected", "warning");
          return;
        }
        setRoles(unsetRoles);
        setCheckedRoles(unsetRoles);
        setSelectedRoles(unsetRoles);
        break;
      case "creationDate":
        clearedFilter = { creationDate: { startDate: "", endDate: "" } };
        if (!startDate && !endDate) {
          ToastHelper.makeToast(toast, "No date selected", "warning");
          return;
        }
        setStartDate("");
        setEndDate("");
        setSelectedStartDate("");
        setSelectedEndDate("");
        break;
      case "all":
        clearedFilter = {
          creationDate: { startDate: "", endDate: "" },
          status: "",
          roles: null,
        };
        setStatus("");
        setSelectedStatus("");
        setRoles(unsetRoles);
        setCheckedRoles(unsetRoles);
        setSelectedRoles(unsetRoles);
        setStartDate("");
        setEndDate("");
        setSelectedStartDate("");
        setSelectedEndDate("");
        break;
      default:
        ToastHelper.makeToast(toast, "Cannot reset filters", "warning");
        return;
    }

    ToastHelper.makeToast(toast, `${filterType === "all" ? "All filters" : "Filter"} cleared`, "success");

    props.setUserFilter!((prevFilter) => ({
      ...prevFilter,
      ...clearedFilter,
    }));

    setOpenPopover(null);
  };

  const handlePopover = (popoverId: string | null) => {
    setOpenPopover(popoverId);
    props.onPopoverChange(popoverId);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    let dateRange = "";
    if (startDate && endDate)
      dateRange += `${dayjs(startDate).format("DD/MM/YYYY")} - ${dayjs(endDate).format("DD/MM/YYYY")}`;
    else if (startDate) dateRange += `After ${dayjs(startDate).format("DD/MM/YYYY")}`;
    else if (endDate) dateRange += `Before ${dayjs(endDate).format("DD/MM/YYYY")}`;

    return dateRange;
  };

  const generateRoleBadges = (selectedRoles: any) =>
    Object.entries(selectedRoles)
      .filter(([role, isSelected]) => isSelected)
      .map(([roleName]) => (
        <Badge key={roleName} colorScheme="purple">
          {RoleTranslator.translateRoles([roleName]).split(" ")[0]}
        </Badge>
      ));

  return (
    <Box w={"full"} mt={5}>
      {/* FILTER BUTTONS */}
      <Flex gap={10} alignItems={"center"} w={"full"}>
        <Text mr={4} fontWeight={"semibold"}>
          Filter by
        </Text>
        {/* STATUS RADIO */}
        <FilterButton
          label="Status"
          icon={<HiOutlineStatusOnline />}
          content={(onSelect: any) => <StatusRadio handleStatusChange={onSelect} />}
          isOpen={openPopover === "status"}
          onOpen={() => handlePopover("status")}
          onClose={handlePopover}
          handleSave={() => handleSave("status")}
          handleReset={() => handleReset("status")}
          onSelect={(value: string) => handleFilterChange("status", value)}
        />
        {/* DATE PICKER */}
        <FilterButton
          label="Creation date"
          icon={<MdDateRange />}
          content={(onSelect: any) => <DateRangePicker handleDateChange={onSelect} />}
          isOpen={openPopover === "creationDate"}
          onOpen={() => handlePopover("creationDate")}
          onClose={handlePopover}
          handleSave={() => handleSave("creationDate")}
          handleReset={() => handleReset("creationDate")}
          onSelect={(dateType: string, value: string) => handleFilterChange(dateType, value)}
        />
        {/* ROLES CHECKBOX */}
        <FilterButton
          label="Role"
          icon={<MdWork />}
          content={(onSelect: any) => <RolesCheckbox handleRolesChange={onSelect} />}
          isOpen={openPopover === "role"}
          onOpen={() => handlePopover("role")}
          onClose={handlePopover}
          handleSave={() => handleSave("role")}
          handleReset={() => handleReset("role")}
          onSelect={(value: { [key: string]: boolean }) => handleFilterChange("roles", value)}
        />
      </Flex>
      {/* BADGES */}
      {(selectedStatus ||
        selectedStartDate ||
        selectedEndDate ||
        Object.values(selectedRoles).some((role) => role)) && (
        <HStack mt={10} alignItems={"baseline"}>
          <Text mr={8} fontWeight={"semibold"}>
            Applied filters:
          </Text>
          {/* STATUS */}
          <Flex direction="row" gap={5}>
            {selectedStatus && <Badge colorScheme="purple">{selectedStatus}</Badge>}
            {/* DATE */}
            {(selectedStartDate || selectedEndDate) && (
              <Badge colorScheme="purple">{formatDateRange(selectedStartDate, selectedEndDate)}</Badge>
            )}
            {/* ROLES */}
            {generateRoleBadges(selectedRoles)}
            <IconButton
              aria-label="clear filters"
              size={""}
              onClick={() => handleReset("all")}
              icon={<FaRegTrashCan />}
            />
          </Flex>
        </HStack>
      )}
    </Box>
  );
}
