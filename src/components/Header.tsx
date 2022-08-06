import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure
} from "@chakra-ui/react";
import NavLink from "./NavLink";
import {FiMenu} from "react-icons/fi";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {selectAuthStatus, signOut} from "../redux/authSlice";

const Header = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onToggle, onClose } = useDisclosure();

  const onLogOutClick = () => {
    dispatch(signOut());
    onClose();
  };

  const Links = (
    <HStack spacing={4}>
      <NavLink to="/" onClick={onClose}>Home</NavLink>
      <NavLink to="/programmes" onClick={onClose}>Programmes</NavLink>
      <NavLink to="/plans" onClick={onClose}>Plans</NavLink>
    </HStack>
  );

  const LogOutButton = (
    <Button onClick={onLogOutClick}>Log Out</Button>
  )

  const isLoggedIn = status === "loggedIn";

  return (
    <Box as="section" pb={{ base: 4, md: 6 }}>
      <Box as="nav" boxShadow={useColorModeValue("sm", "sm-dark")}>
        <Container maxW="container.lg" py={{ base: 3, lg: 4 }}>
          <HStack spacing={8} justify="space-between">
            <Heading size="md" pr={4}>
              Study Plan Manager
            </Heading>

            {isDesktop ? (
              <Flex justify="space-between" flex="1">
                {isLoggedIn && Links}
                {isLoggedIn && LogOutButton}
              </Flex>
            ) : isLoggedIn && (
              <IconButton
                variant="ghost"
                aria-label="Open menu"
                icon={<FiMenu fontSize="1.25rem" />}
                onClick={onToggle}
              />
            )}
          </HStack>
          {(!isDesktop && isOpen) && (
            <Flex justify="space-between" flex="1" pt={4}>
              {isLoggedIn && Links}
              {isLoggedIn && LogOutButton}
            </Flex>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
