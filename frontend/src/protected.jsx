import { Navigate, Outlet, useLocation } from "react-router-dom";
import useUserStore from "./store/useUserStore";
import { useEffect, useState } from "react";
import { checkAuth } from "./services/user.Service";
import Loader from "./utils/Loader";

export const ProtectedRoute = () => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated, setUser, clearUser } = useUserStore();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkAuth();
        if (result?.isAuth) {
          // console.log("result is after check auth  " , result)
          setUser(result.user);
        } else {
          clearUser();
        }
      } catch (error) {
        console.log("Error user not found", error);
        clearUser();
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [setUser, clearUser]);
  if (isChecking) {
    return <Loader />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
