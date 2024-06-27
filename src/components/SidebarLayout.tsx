import React, { Fragment, useEffect, useMemo, useState } from "react";
import { ClickAwayListener } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarLayout = ({ children }: any) => {
  const modules_list = [
    {
      name: "Dashboard",
      link: "/admin/dashboard",
      icon: "/assets/sidebar/stats.svg",
      sub_list: [],
      isActive: false,
    },

    {
      name: "Employee",
      link: "/admin/employees",
      icon: "/assets/sidebar/employees.svg",
      sub_list: [],
      isActive: false,
    },

    {
      name: "Card Request",
      link: "/admin/card-request",
      icon: "/assets/sidebar/cart.svg",
      sub_list: [],
      isActive: false,
    },

    {
      name: "Users",
      link: "/admin/user",
      icon: "/assets/sidebar/user.svg",
      sub_list: [
        {
          name: "User",
          link: "/admin/user",
          isActive: false,
          child_list: [],
        },
        {
          name: "User Roles",
          link: "/admin/user-roles",
          isActive: false,
          child_list: [],
        },
      ],
      isActive: false,
    },
  ] as any;

  const [modules, setModules] = useState(modules_list) as any;

  const toggleActive = (index: any) => {
    let temp = [...modules_list];
    temp[index] = {
      ...temp[index],
      isActive: true,
    };
    setModules(temp);
  };

  const toggleSubItem = (outerIndex: any, innerIndex: any) => {
    let temp = [...modules_list];
    temp[outerIndex].sub_list[innerIndex] = {
      ...temp[outerIndex].sub_list[innerIndex],
      isActive: !temp[outerIndex].sub_list[innerIndex].isActive,
    };
    temp[outerIndex].isActive = true;

    setModules(temp);
  };

  const toggleChildItem = (
    outerIndex: any,
    innerIndex: any,
    childIndex: any
  ) => {
    let temp = [...modules_list];
    temp[outerIndex].sub_list[innerIndex].child_list[childIndex] = {
      ...temp[outerIndex].sub_list[innerIndex].child_list[childIndex],
      isActive:
        !temp[outerIndex].sub_list[innerIndex].child_list[childIndex].isActive,
    };
    temp[outerIndex].isActive = true;
    temp[outerIndex].sub_list[innerIndex].isActive = true;

    setModules(temp);
  };

  //   const Router = useRouter();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  useEffect(() => {
    let temp = [...modules_list];

    temp.map((item) => {
      if (pathname.includes(item.link)) {
        item.isActive = true;
      }

      item?.sub_list?.map((subItem: any) => {
        if (subItem.name === "User" || subItem.name === "User Roles") {
          if (pathname === subItem.link) {
            item.isActive = true;
            subItem.isActive = true;
          }
        } else {
          if (pathname.includes(subItem.link)) {
            item.isActive = true;
            subItem.isActive = true;
          }
        }

        subItem?.child_list?.map((childItem: any) => {
          if (pathname === childItem.link) {
            item.isActive = true;
            subItem.isActive = true;
            childItem.isActive = true;
          }
        });
      });
    });
    setModules(temp);
  }, [pathname]);

  const [isExpanded, setIsExpanded] = useState(true);

  const toggleMenu = () => {
    setIsExpanded((prevState) => !prevState);
  };


  useMemo(() => {
    if (typeof window !== "undefined") {
      navigate("/admin/dashboard");
    }
  }, []);

  const [lmenu, setLmenu] = useState(false);
  const toggelLMenu = () => {
    setLmenu((prevState) => !prevState);
  };
  return (
    <Fragment>
      {pathname === "/" ||
      pathname === "/login" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ? (
        <Fragment>{children}</Fragment>
      ) : (
        <div className="flex flex-row items-start w-full h-screen relative overflow-x-hidden">
          <div
            className={`${
              isExpanded ? "lg:w-2/12" : "w-[4.5rem]"
            } bg-[#19191D] h-full flex-shrink-0 flex flex-col fixed z-[22] transition-all ease-linear duration-200`}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full absolute -right-5 top-14 z-[23]">
              <button onClick={toggleMenu}>
                <img
                  src="/assets/icons/collapse.svg"
                  alt="collapse"
                  className={`w-10 h-10 ${
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
                  src="/assets/icons/scube.svg"
                  alt="scube"
                  className="w-28 h-12"
                />
              ) : (
                <h2 className="text-4xl text-white font-semibold text-center">
                  S
                </h2>
              )}
            </div>

            <div className="flex flex-col overflow-x-hidden">
              {React.Children.toArray(
                modules.map((item: any, outerIndex: any) => (
                  <div
                    className={`flex flex-col ${
                      item.isActive && item?.sub_list?.length > 0
                        ? isExpanded
                          ? "bg-zinc"
                          : "bg-blue-600"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (item.isActive && item?.sub_list?.length > 1) {
                          return;
                        } else {
                          toggleActive(outerIndex);
                          navigate(item.link);
                        }
                      }}
                      className={`${
                        item?.isActive && item.sub_list.length === 0
                          ? "bg-blue-600 text-white"
                          : "bg-transparent text-white"
                      } p-3 text-start text-base font-medium flex items-center  ${
                        isExpanded ? "justify-between" : "justify-center"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.icon}
                          alt={item.icon}
                          className="w-6 h-6"
                        />
                        <Fragment>
                          {isExpanded && <span>{item?.name}</span>}
                        </Fragment>
                      </div>

                      {item?.sub_list?.length > 0 && isExpanded && (
                        <img
                          src="/assets/icons/acc.svg"
                          alt="acc"
                          className={`w-6 h-6  ${
                            item.isActive ? "-rotate-180" : "rotate-0"
                          }`}
                        />
                      )}
                    </button>

                    <div className={`flex flex-col w-full`}>
                      {item.isActive ? (
                        <div className="flex flex-col">
                          {React.Children.toArray(
                            item?.sub_list?.map(
                              (subItem: any, innerIndex: any) => (
                                <Fragment>
                                  <div
                                    className={`border-l border-[#808080] ml-7 ${
                                      isExpanded ? "flex" : "hidden"
                                    }`}
                                  >
                                    <button
                                      onClick={() => {
                                        if (
                                          subItem.isActive &&
                                          subItem.child_list.length > 0
                                        ) {
                                          return;
                                        } else {
                                          navigate(subItem.link);
                                          toggleSubItem(outerIndex, innerIndex);
                                        }
                                      }}
                                      className={`${
                                        subItem?.isActive &&
                                        subItem?.child_list?.length === 0
                                          ? "bg-blue-600 text-white"
                                          : "bg-transparent text-white"
                                      } py-3 px-3 w-full lg:text-base font-medium text-sm text-start flex items-center justify-between`}
                                    >
                                      {subItem.name}

                                      {subItem?.child_list?.length > 0 && (
                                        <img
                                          src="/assets/icons/acc.svg"
                                          alt="acc"
                                          className={`w-6 h-6  ${
                                            subItem.isActive
                                              ? "-rotate-180"
                                              : "rotate-0"
                                          }`}
                                        />
                                      )}
                                    </button>

                                    {subItem?.child_list?.length > 0 &&
                                    subItem.isActive ? (
                                      <div className="flex flex-col ml-6 border-l pb-1 border-[#808080]">
                                        {React.Children.toArray(
                                          subItem?.child_list?.map(
                                            (
                                              childItem: any,
                                              childIndex: any
                                            ) => (
                                              <button
                                                onClick={() => {
                                                  navigate(childItem.link);
                                                  toggleChildItem(
                                                    outerIndex,
                                                    innerIndex,
                                                    childIndex
                                                  );
                                                }}
                                                className={`${
                                                  childItem.isActive
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-transparent text-white"
                                                } py-3  pl-3 w-full lg:text-base font-medium text-sm text-start`}
                                              >
                                                {childItem.name}
                                              </button>
                                            )
                                          )
                                        )}
                                      </div>
                                    ) : (
                                      <Fragment />
                                    )}
                                  </div>
                                </Fragment>
                              )
                            )
                          )}
                        </div>
                      ) : (
                        <Fragment />
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
                <Fragment />
              )}
            </div>
          </div>

          <div
            className={`${
              isExpanded ? "lg:w-10/12" : "lg:w-[96%]"
            } h-full flex-shrink-0 bg-[#F9FAFB] ml-auto transition-all ease-linear duration-200`}
          >
            <div className="h-12 bg-[#19191D] w-full  shadow flex items-center justify-end px-4 sticky top-0 z-[20]">
              <button onClick={toggelLMenu} className="flex items-center gap-1">
                <p className="lg:text-base text-sm text-white font-medium">
                  Hello, User
                </p>

                <img
                  src="/assets/icons/acc.svg"
                  alt="acc"
                  className="w-6 h-6"
                />
              </button>

              {lmenu && (
                <ClickAwayListener onClickAway={() => setLmenu(false)}>
                  <div className="w-[220px] absolute top-14 right-2 bg-white shadow-lg">
                    <button
                      onClick={() => {
                        // clear localstorage
                        setLmenu(false);
                        navigate("/login");
                      }}
                      className="hover:bg-[#808080]/20 w-full p-3 text-base text-primaryDark"
                    >
                      Logout
                    </button>
                  </div>
                </ClickAwayListener>
              )}
            </div>

            <div
              className={`w-full ${isExpanded ? "p-6" : "py-6 px-10"} z-[19]`}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default SidebarLayout;
