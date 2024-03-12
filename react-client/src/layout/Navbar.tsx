import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";
import { useContext, useEffect, useState } from "react";
import PrincipalContext from "../utils/contexts/PrincipalContext";
import { useNavigate } from "react-router-dom";
import companyService from "../services/CompanyService";
import roleTranslator from "../utils/RoleTranslator";
import SidebarStatusContext from "../utils/contexts/SidebarStatusContext";
import authService from "../services/AuthService";
import ToastHelper from "../utils/ToastHelper";
import ToastContext from "../utils/contexts/ToastContext";

interface Company {
  id: number;
  name: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const { principal, dispatchPrincipal } = useContext(PrincipalContext);
  const { sidebarStatus } = useContext(SidebarStatusContext);
  const [company, setCompany] = useState<Company | null>();

  useEffect(() => {
    if (!principal || !principal.companyID) return;

    async function getData() {
      try {
        let result = await companyService.getCompanyByID(principal!!.companyID!!);
        setCompany(result);
      } catch (e) {
        console.log(e);
      }
    }

    getData();
  }, [principal]);

  async function handleSignOut() {
    if (principal) {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) await authService.logout(parseInt(principal.id), refreshToken);
      } catch (e) {
        console.log("ref token delete failed", e);
      }
    }

    dispatchPrincipal({
      principal: null,
      type: "logout",
    });

    ToastHelper.makeToast(toast, "Logout successful", "success");
    navigate("/login");
  }

  function handleLoginButtonClick() {
    navigate("/login");
  }

  function handleMyAccountClick() {
    navigate("/my-account");
  }

  return (
    <Flex
      px={4}
      height="20"
      alignItems="center"
      bg={"white"}
      borderBottomWidth="1px"
      borderBottomColor={"gray.200"}
      justifyContent={{ base: "space-between", md: "flex-end" }}
    >
      {principal ? (
        <HStack
          pl={sidebarStatus.status === "open" ? "289px" : "75px"}
          w={"full"}
          spacing={{ base: "0", md: "6" }}
          justifyContent={"space-between"}
        >
          <Box
            _hover={{
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            {!principal.isTemp && <Heading size={"md"}>{company ? company.name : "AROL"}</Heading>}
          </Box>
          <HStack>
            <Flex alignItems={"center"}>
              <Menu>
                <MenuButton py={2} transition="all 0.3s" _focus={{ boxShadow: "none" }}>
                  <HStack>
                    <Avatar size={"sm"} name={principal.name + " " + principal.surname} />
                    <VStack display={{ base: "none", md: "flex" }} alignItems="flex-start" spacing="1px" ml="2">
                      <Text fontSize="md">{principal.name + " " + principal.surname}</Text>
                      <Text fontSize="xs" color="gray.600" fontWeight={500}>
                        {roleTranslator.translateRolesForNavbar(principal)}
                      </Text>
                    </VStack>
                    <Box display={{ base: "none", md: "flex" }}>
                      <FiChevronDown />
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList bg={"white"} borderColor={"gray.200"}>
                  <MenuItem icon={<FiLogOut />} onClick={handleSignOut}>
                    Sign out
                  </MenuItem>
                  {!principal.isTemp && (
                    <MenuItem icon={<FiUser />} onClick={handleMyAccountClick}>
                      My account
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Flex>
          </HStack>
        </HStack>
      ) : (
        <HStack>
          <Button colorScheme={"blue"} variant={"outline"} onClick={handleLoginButtonClick}>
            Login
          </Button>
        </HStack>
      )}
    </Flex>
  );
}
