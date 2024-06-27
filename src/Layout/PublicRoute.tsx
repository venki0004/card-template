import { getLoggedInUser } from "../utils/auth";
import { Navigate } from "react-router-dom";

type Children = {
  children: any;
};

export const RestrictedRoute = ({ children }: Children) => {
  const auth = true; //UserLoggedIn();

  const user = getLoggedInUser();
  return !auth ? children : <Navigate to="/admin/dashboard" />;
};
