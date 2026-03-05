import { motion } from "framer-motion";
import { persistor } from "../index";
import React, { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Logout, Menu as MenuIcon } from "@mui/icons-material";
import { logoutUser, selectUser } from "../pages/loginView/authSlice";
import { toggleSidebarCollapse, setSidebarCollapsed } from "../api/uiSlice";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Chip,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import api from "../api/axiosConfig";

//---------------------------------------
// :: Logic Hook
//---------------------------------------

const useMenuAppBarLogic = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const user = useSelector(selectUser);

  const handleLogout = useCallback(async () => {
    try {
      dispatch(logoutUser());
      await persistor.purge();
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common["Authorization"];

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      dispatch({ type: "RESET_ALL" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.replace("/login");
    }
  }, [dispatch]);

  const handleMenuClick = useCallback(() => {
    isMobile
      ? dispatch(setSidebarCollapsed(false))
      : dispatch(toggleSidebarCollapse());
  }, [dispatch, isMobile]);

  const roleColor = useCallback((role) => {
    const map = { admin: "error", manager: "warning", staff: "success" };
    return map[role] || "success";
  }, []);

  return { handleLogout, handleMenuClick, roleColor, isMobile, isSmallMobile, user };
};

//---------------------------------------
// :: MenuAppBar Component
//---------------------------------------

const MenuAppBar = () => {
  const { handleLogout, handleMenuClick, roleColor, isMobile, isSmallMobile, user } =
    useMenuAppBarLogic();

  const logoutButtonStyles = useMemo(
    () => ({
      color: "white",
      borderRadius: 0,
      fontSize: isMobile ? "0.8rem" : "0.875rem",
      px: 2,
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.15)",
        color: "#FFFDD0",
      },
    }),
    [isMobile]
  );

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
        color: "white",
        borderRadius: 0,
        boxShadow: "none",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ px: isSmallMobile ? 1 : 2 }}>
        {user?.role !== "staff" && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleMenuClick}
            sx={{
              mr: isSmallMobile ? 1 : 2,
              borderRadius: 0,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant={isSmallMobile ? "h6" : "h5"}
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          PBIS
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {!isSmallMobile && user && (
            <Chip
              label={user.role.toUpperCase()}
              size="small"
              color={roleColor(user.role)}
              sx={{
                borderRadius: 0,
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            />
          )}

          {isSmallMobile ? (
            <IconButton
              onClick={handleLogout}
              sx={{
                color: "white",
                borderRadius: 0,
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
              }}
            >
              <Logout />
            </IconButton>
          ) : (
            <Button
              onClick={handleLogout}
              startIcon={<Logout />}
              sx={logoutButtonStyles}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(MenuAppBar);