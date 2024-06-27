import moment from "moment";
import { toast } from "react-toastify";
import { getLoggedInUser } from "./auth";

/* eslint-disable */
export const CountItems = (data: any) => {
  let total = 0;
  Object.values(data).forEach((val) => {
    if (val === null || val === undefined || val === "") {
      return true;
    }
    total += 1;
  });
  return total;
};

/* eslint-disable */
export const uuid = () => {
  let uuid = "";
  let i;
  for (i = 0; i < 32; i += 1) {
    switch (i) {
      case 8:
      case 20:
        uuid += "-";
        uuid += (Math.random() * 16 || 0).toString(16);
        break;
      case 12:
        uuid += "-";
        uuid += "4";
        break;
      case 16:
        uuid += "-";
        uuid += (Math.random() * 4 || 8).toString(16);
        break;
      default:
        uuid += (Math.random() * 16 || 0).toString(16);
    }
  }
  return uuid;
};
/* eslint-enable */
export const capitalize = (string: string) => {
  if (!string) {
    return "";
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeUpperToLower = (string: string) => {
  if (!string) {
    return "";
  }

  return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
};

export const getValueAsFloatWithNDecimalPlaces = (
  value: number,
  decimalPlaces: number
) => {
  if (["0", 0].includes(value)) {
    return value;
  }

  return Number(value).toFixed(decimalPlaces);
};

export const validateArray = (array: any[]) => {
  if (!array || !Array.isArray(array) || !array.length) {
    return [];
  }

  return array;
};

export const copyToClipboard = (value: string) => {
  const decodedValue = value.replace(/&amp;/g, '&')
                             .replace(/&lt;/g, '<')
                             .replace(/&gt;/g, '>')
                             .replace(/&quot;/g, '"')
                             .replace(/&#039;/g, "'");
  navigator.clipboard.writeText(decodedValue);
};

export const showToastMessage = (message: string, type: string) => {
  if (type === "error") {
    toast.error(message, {
      position: toast.POSITION.TOP_RIGHT,
    });
  } else {
    toast.success(message, {
      position: toast.POSITION.TOP_RIGHT,
    });
  }
};

/* eslint-enable */

export const isDate = (params: any) => {
  for (let key in params) {
    if (params[key].toString().includes("-")) return true;
  }
};

export const getUserBaseModulePath = (user: any) => {
  let path = "/";
  if (!user) return "/login";

  let dashboardRole = user.user_permissions.find(
    (x: any) => x.slug === "dashboard"
  );
  if (dashboardRole) {
    path = "/admin/dashboard";
  } else {
    let module = user.user_permissions[0];
    if (!module) return "/admin/dashboard";
    let submodules = user.user_permissions.filter(
      (x: any) => x.parent_id === module.id
    );
    if (module && !submodules.length) {
      path = `/admin/${module.slug}`;
    } else {
      path = `/admin/${module.slug}/${submodules[0].slug}`;
    }
  }
  return path;
};

export const checkModuleAccess = (module: string, user: any) => {
  return user.user_permissions.some((x: any) => x.slug === module);
};

export const checkModulePrivilegeAccess = (module: string, permission: any) => {
  const user = getLoggedInUser();
  let moduleMeta = user.user_permissions.find((x: any) => x.slug === module);
  return moduleMeta && moduleMeta[permission] ? true : false;
};

export const dateRange = (type: any) => {
  let range: any = [];

  switch (type) {
    case "0":
      range = [
        moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      ];
      break;
    case "-1":
      range = [
        moment()
          .subtract(1, "days")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment().subtract(1, "days").endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      ];
      break;
    case "-7":
      range = [
        moment()
          .subtract(6, "days")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      ];
      break;
    case "-30":
      range = [
        moment()
          .subtract(29, "days")
          .startOf("day")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment().endOf("day").format("YYYY-MM-DD HH:mm:ss"),
      ];
      break;
    case "TM":
      range = [
        moment().startOf("month").format("YYYY-MM-DD HH:mm:ss"),
        moment().endOf("month").format("YYYY-MM-DD HH:mm:ss"),
      ];
      break;
    case "LM":
      range = [
        moment()
          .subtract(1, "month")
          .startOf("month")
          .format("YYYY-MM-DD HH:mm:ss"),
        moment()
          .subtract(1, "month")
          .endOf("month")
          .format("YYYY-MM-DD HH:mm:ss"),
      ];
      break;
    default:
      range = [];
  }
  return range;
};

export const defaultFiltersDropDown = [
  {
    id: "ALL",
    name: "All",
  },
  {
    id: "0",
    name: "Today",
  },
  {
    id: "-1",
    name: "Yesterday",
  },
  {
    id: "-7",
    name: "Last 7 Days",
  },
  {
    id: "-30",
    name: "Last 30 Days",
  },
  {
    id: "custom",
    name: "Custom Date",
  },
];

export const selectWeekOrMonth = [
  {
    id: "ALL",
    name: "All",
  },
  {
    id: "-7",
    name: "Last 7 Days",
  },
  {
    id: "-30",
    name: "Last 30 Days",
  },
];

export const validatePhoneNumber = (number:string) =>{
  var pattern = /^(?:(?:\+|0{0,2})91)?([6-9]\d{9})$/;
    return pattern.test(number);
}