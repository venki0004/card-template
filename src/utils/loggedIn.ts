import { decryptData } from "./encryption";

export const isAuthenticated = () => {
  if (typeof localStorage !== "undefined") {
    const token = decryptData(localStorage.getItem("user"));
    return !!token;
  } else {
    return false;
  }
};

export const Logout = () => {
  const token = decryptData(localStorage.getItem("user"));
  if (token) {
    localStorage.removeItem("user");
    localStorage.removeItem("activeIndex");
    return true;
  }

  return false;
};

export const getToken = () => {
  if (typeof localStorage != "undefined") {
    let token = JSON.parse(decryptData(localStorage.getItem("user")) as any);

    if (token) {
      return token.token;
    }
  }
  return "";
};
