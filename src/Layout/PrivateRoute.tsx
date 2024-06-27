import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getLoggedInUser, isUserLoggedIn } from "../utils/auth";
import { ClickAwayListener } from "@mui/material";
import { checkModuleAccess, showToastMessage } from "../utils/helpers";
import { axiosInstance } from "../utils/axios";

type PrivateRouteProps = {
  children: any;
  module: string;
};

const modules = [
  {
    name: "Dashboard",
    icon: "/assets/sidebar/stats.svg",
    sub_menus: [],
    index: 1,
    link: "/admin/dashboard",
    module: "dashboard",
  },
  {
    name: "Employee",
    icon: "/assets/sidebar/employees.svg",
    index: 2,
    link: "/admin/employees",
    module: "employees",
    sub_menus: [
      {
        name: "Employees List",
        link: "/all-employees",
        sub_module: "all-employees",
      },
      {
        name: "Distributors",
        link: "/distributors",
        sub_module: "distributors",
      },
    ],
  },

  {
    name: "Card Request",
    icon: "/assets/sidebar/cart.svg",
    sub_menus: [],
    index: 3,
    link: "/admin/card-requests",
    module: "card-requests",
  },
  {
    name: "Reports",
    icon: "/assets/sidebar/reports.svg",
    sub_menus: [],
    index: 4,
    link: "/admin/reports",
    module: "reports",
  },
  {
    name: "User Settings",
    link: "/admin/user-settings",
    icon: "/assets/sidebar/user.svg",
    module:'user-settings',
    index: 5,
    sub_menus: [
      {
        name: "User List",
        link: "/users",
        sub_module: "users",
      },
      {
        name: "User Roles",
        link: "/roles",
        sub_module: "roles",
      },
    ],
  },
] as any;

const PrivateRoute = ({ children, module }: PrivateRouteProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOpenLogoutMenu, setIsOpenLogoutMenu] = useState(false);
  const [menuIndex, setMenuIndex] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();

  const auth = isUserLoggedIn();

  if (!auth) {
    return <Navigate to="/login" />;
  }

  const toggleMenu = () => {
    setIsExpanded((prevState) => !prevState);
  };
  const loggedUser = getLoggedInUser();

  let user: any = {
    name: "",
    email: "",
  };

  if (loggedUser) {
    user = loggedUser;
  }
  
  async function logout() {
    await  axiosInstance.post('/logout')
    showToastMessage("Logout successfully.", "success");
    localStorage.removeItem('auth-user');
    localStorage.removeItem('user-token');
    navigate("/login");
  }

  const { pathname } = location;
  const splitLocation = pathname.split("/");
  const ROUTES = loggedUser
    ? modules.filter((x: any) => {
        let is_match = Array.isArray(loggedUser.user_permissions)
          ? loggedUser.user_permissions.find((y: any) => y.slug === x.module)
          : false;
        return !!is_match;
      }).map((x: any) => {
        x.sub_menus = x.sub_menus.filter((y: any) => {
          let is_match = loggedUser.user_permissions.find(
            (z: any) => z.slug === y.sub_module
          );
          return !!is_match;
        });
        return x;
      })
    : modules && checkModuleAccess(module, user);

  const toggleLogoutMenu = () => {
    setIsOpenLogoutMenu((prevState) => !prevState);
  };

  return true ? (
    <div className="flex flex-row items-start w-full h-screen relative overflow-x-hidden">
      <div
        className={`${
          isExpanded ? "lg:w-2/12" : "w-[4.5rem]"
        } bg-[#19191D] h-full flex-shrink-0 flex flex-col fixed z-[22] transition-all ease-linear duration-200`}
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full absolute top-14  -right-5 z-[23]">
          <button onClick={toggleMenu}>
            <img
              src="/assets/icons/collapse.svg"
              alt="collapse"
              className={`w-7 h-7 ${
                isExpanded
                  ? "transition-all ease-linear duration-200 rotate-0"
                  : "-rotate-180 transition-all ease-linear duration-200"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-center h-20">
          {isExpanded ? (
            <img
              src="/assets/icons/axis.svg"
              alt="Axis"
              className="w-40 h-20"
            />
          ) : (
            <img
              src="/assets/icons/axis-small.svg"
              alt="Axis"
              className="w-10"
            />
          )}
        </div>

        <div className="flex flex-col overflow-x-hidden">
          {React.Children.toArray(
            ROUTES.map((item: any, outerIndex: any) => (
              <div
                className={`flex flex-col ${
                  (splitLocation.includes(item.module) &&
                    menuIndex === outerIndex) &&
                  item?.sub_menus?.length > 0
                    ? isExpanded
                      ? "bg-zinc"
                      : "bg-blue-600"
                    : ""
                }`}
              >
                <button
                  onClick={() => {
                    if (item?.sub_menus?.length > 1) {
                      setMenuIndex(outerIndex);
                    } else {
                      navigate(item.link);
                    }
                  }}
                  className={`${
                    splitLocation.includes(item.module) &&
                    item.sub_menus.length === 0
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-white"
                  } p-3 text-start text-base font-medium flex items-center  ${
                    isExpanded ? "justify-between" : "justify-center"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={item.icon} alt={item.icon} className="w-6 h-6" />
                    {isExpanded && <span>{item?.name}</span>}
                  </div>

                  {item?.sub_menus?.length && isExpanded ? (
                    <img
                      src="/assets/icons/acc.svg"
                      alt="acc"
                      className={`w-6 h-6  ${
                        item.isActive ? "-rotate-180" : "rotate-0"
                      }`}
                    />
                  ) : (
                    <></>
                  )}
                </button>
                <div className={`flex flex-col w-full`}>
                  {(menuIndex === outerIndex || splitLocation.includes(item.module)) ? (
                    <div className="flex flex-col pb-1">
                      {React.Children.toArray(
                        item?.sub_menus?.map(
                          (subItem: any, innerIndex: any) => (
                            <div
                              className={`border-l border-[#808080] ml-7 ${
                                isExpanded ? "flex" : "hidden"
                              }`}
                            >
                              <button
                                onClick={() => {
                                  navigate(`${item.link}${subItem.link}`);
                                }}
                                className={`${
                                  splitLocation.includes(subItem.sub_module) 
                                    ? "bg-blue-600 text-white"
                                    : "bg-transparent text-white"
                                } py-3 px-3 w-full lg:text-base font-medium text-sm text-start flex items-center justify-between`}
                              >
                                {subItem.name}
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-6 w-full flex flex-col items-center justify-center">
          {isExpanded ? (
            <img
              src="/assets/icons/poweredBy.svg"
              alt="poweredBy"
              className="invert"
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      <div
        className={`${
          isExpanded ? "lg:w-10/12" : "lg:w-[96%]"
        } h-full flex-shrink-0 bg-[#F9FAFB] ml-auto transition-all ease-linear duration-200`}
      >
        <div className="h-12 bg-[#19191D] w-full  shadow flex items-center justify-end px-4 sticky top-0 z-[20]">
          <button
            onClick={toggleLogoutMenu}
            className="flex items-center gap-1"
          >
            <p className="lg:text-base text-sm text-white font-medium">
              Hello, {user?.name}
            </p>

            <img src="/assets/icons/acc.svg" alt="acc" className="w-6 h-6" />
          </button>

          {isOpenLogoutMenu && (
            <ClickAwayListener onClickAway={() => setIsOpenLogoutMenu(false)}>
              <div className="w-[220px] absolute top-14 right-2 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setIsOpenLogoutMenu(false);
                    logout();
                  }}
                  className="hover:bg-[#808080]/20 w-full p-3 text-base text-primaryDark"
                >
                  Logout
                </button>
              </div>
            </ClickAwayListener>
          )}
        </div>

        <main
          className={`flex-1  overflow-hidden overflow-y-scroll mx-4 ${
            isExpanded ? "p-4" : "p-5"
          } z-[19]`}
        >
          {children}
        </main>
      </div>
    </div>
  ) : (
    <Navigate to="/un-authorized" />
  );
};

export default PrivateRoute;
