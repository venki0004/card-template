import { getLoggedInUser } from "../utils/auth";
import { Navigate } from "react-router-dom";

type Children = {
  children: any;
};

export const RestrictedRoute = ({ children }: Children) => {
  const user = getLoggedInUser();
  return !user ? children : <Navigate to="/admin/dashboard" />;
};
