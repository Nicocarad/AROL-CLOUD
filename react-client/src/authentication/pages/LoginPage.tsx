import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useContext, useEffect, useState } from "react";
import PrincipalContext from "../../utils/contexts/PrincipalContext";
import authService from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import ToastContext from "../../utils/contexts/ToastContext";
import axiosExceptionHandler from "../../utils/AxiosExceptionHandler";
import ToastHelper from "../../utils/ToastHelper";

export default function LoginPage() {
  const navigate = useNavigate();
  // const location = useLocation();
  const { dispatchPrincipal } = useContext(PrincipalContext);
  const toast = useContext(ToastContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submit, setSubmit] = useState(false);

  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!submit) return;

    async function doLogin() {
      try {
        const result = await authService.login({
          email: email,
          password: password,
        });

        dispatchPrincipal({
          type: rememberMe ? "login-remember" : "login-no-remember",
          principal: result,
        });
        setAuthError("");

        if (result.isTemp) navigate("/login");
        else {
          ToastHelper.makeToast(toast, "Login successful", "success");
          navigate("/");
        }
      } catch (e) {
        console.log(e);
        axiosExceptionHandler.handleAxiosExceptionForLoginWithSetState(e, setAuthError);
      }

      setSubmit(false);
    }

    doLogin();
  }, [dispatchPrincipal, email, navigate, password, rememberMe, submit, toast]);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <Stack
      w={1000}
      mx={"auto"}
      minH={"full"}
      direction={{ base: "column", md: "row" }}
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={"2xl"}
      rounded={"lg"}
      p={6}
    >
      <Flex p={6} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={8}>
          <Heading fontSize={"4xl"} textAlign={"center"}>
            Sign in to your account
          </Heading>
          {authError && (
            <Alert status="error" rounded={"md"}>
              <AlertIcon />
              <Box w={"full"}>{authError}</Box>
              <CloseButton
                alignSelf="flex-start"
                position="relative"
                right={-1}
                top={-1}
                onClick={() => setAuthError("")}
              />
            </Alert>
          )}
          <FormControl id="email" isRequired>
            <FormLabel>Email address</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement h={"full"}>
                <Button variant={"ghost"} onClick={() => setShowPassword((showPassword) => !showPassword)}>
                  {showPassword ? <FiEye size={48} /> : <FiEyeOff size={48} />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Stack spacing={6}>
            <Stack direction={{ base: "column", sm: "row" }} align={"start"} justify={"space-between"}>
              <Checkbox isChecked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                Remember me
              </Checkbox>
            </Stack>

            <Button
              isLoading={submit}
              loadingText="Signing in"
              colorScheme={"blue"}
              variant={"solid"}
              onClick={() => setSubmit(true)}
              type="submit"
            >
              Sign in
            </Button>
          </Stack>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Image alt={"Login Image"} objectFit={"contain"} src={require("./../../assets/arol-logo.png")} />
      </Flex>
    </Stack>
  );
}
