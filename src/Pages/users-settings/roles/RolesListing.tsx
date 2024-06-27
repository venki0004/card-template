import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import moment from "moment";

import { axiosInstance } from "../../../utils/axios";
import { ValidateFields } from "../../../utils/validator";
import {
  checkModulePrivilegeAccess,
  showToastMessage,
} from "../../../utils/helpers";
import CustomButton from "../../../components/CustomButton";
import RoleModal from "./create/RoleModal";
import { getLoggedInUser } from "../../../utils/auth";

const RolesListing = () => {
  const [modules, setModules] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [metadata, setMetaData] = useState({} as any);
  const [isApiLoading, setApiLoading] = useState(false);
  const loggedUser = getLoggedInUser();

  const columnDefs = [
    { headerName: "Role ID", field: "id" },
    { headerName: "Role Name", field: "name" },
    { headerName: "Total Users", field: "user_count" },
    {
      headerName: "Access Level",
      field: "is_manager",
      cellRenderer: (params: any) =>
        params.value === 1 ? "Manager" : "Executive",
    },
    {
      headerName: "Created On",
      field: "created_at",

      cellRenderer: (params: any) =>
        params.value
          ? moment(params?.value).utcOffset("+00:00").format("h:mm A, DD/M/yy")
          : "--",
    },
    {
      headerName: "Actions",
      field: "status",
      cellRenderer: (params: any) => {
        return (
          <div className="flex mt-1 items-center gap-3">
            <button
              onClick={() => {
                onRowEdit(params?.data);
              }}
            >
              <img src="/assets/icons/userEditIcon.svg" alt="edit" />
            </button>
          </div>
        );
      },

      suppressMenu: true,
      sortable: false,
      filter: false,
    },
  ] as any;

  let fields = {
    name: "",
  };

  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState(fields);
  const [params, setParams] = useState({
    name: "",
    role: "Manager",
    id: "",
    is_manager: false,
    list: [],
  } as any);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    axiosInstance
      .get(`roles?page=1&size=20`)
      .then((res) => {
        setRowData(res.data.data?.data);
        setParams({ ...params });
        setMetaData(res?.data?.data?.pagination);
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleRootChange = (e: any, item: any) => {
    const { name, checked } = e.target;
    let list = [...params.list] as any;
    let index = list.findIndex((x: any) => x.id == item.id);
    if (index != -1) {
      if (
        checked &&
        ["is_write", "is_update", "is_read", "is_delete"].includes(name)
      ) {
        list[index].is_checked = checked;
        list[index][name] = checked;
      } else if (checked) {
        handleCheckBoxSel(list, index, checked);
      }

      if (
        !checked &&
        ["is_write", "is_update", "is_read", "is_delete"].includes(name)
      ) {
        list[index][name] = checked;
        let item = list[index];
        if (
          !item.is_write &&
          !item.is_update &&
          !item.is_read &&
          !item.is_delete
        ) {
          list[index].is_checked = checked;
        }
      }

      if (
        !checked &&
        !["is_write", "is_update", "is_read", "is_delete"].includes(name)
      ) {
        handleCheckBoxSel(list, index, checked);
      }
    }
    setParams({ ...params, list: list });
  };

  const handleCheckBoxSel = (list: any, index: any, checked: any) => {
    list[index].is_checked = checked;
    list[index]["is_write"] = checked;
    list[index]["is_update"] = checked;
    list[index]["is_read"] = checked;
    list[index]["is_delete"] = checked;
    list[index].children = list[index].children.map((x: any) => {
      x["is_checked"] = checked;
      x["is_write"] = checked;
      x["is_update"] = checked;
      x["is_read"] = checked;
      x["is_delete"] = checked;
      return x;
    });
  };

  const handleNestedCheckBoxSel = (
    list: any,
    index: any,
    checked: any,
    child: any
  ) => {
    let subIndex = list[index].children.findIndex(
      (x: any) => x.id === child.id
    );
    if (subIndex != -1) {
      list[index].children[subIndex].is_checked = checked;
      list[index].children[subIndex]["is_write"] = checked;
      list[index].children[subIndex]["is_update"] = checked;
      list[index].children[subIndex]["is_read"] = checked;
      list[index].children[subIndex]["is_delete"] = checked;
    }
    let is_child_checked = list[index].children.some((x: any) => x.is_checked);
    list[index].is_checked = is_child_checked;
  };

  const handleChildChange = (e: any, item: any, child: any) => {
    const { name, checked } = e.target;
    let list = [...params.list] as any;
    let index = list.findIndex((x: any) => x.id == item.id);
    if (index != -1) {
      if (
        checked &&
        ["is_write", "is_update", "is_read", "is_delete"].includes(name)
      ) {
        list[index].is_checked = checked;
        let subIndex = list[index].children.findIndex(
          (x: any) => x.id === child.id
        );
        if (subIndex != -1) {
          list[index].children[subIndex].is_checked = checked;
          list[index].children[subIndex][name] = checked;
        }
      } else if (checked) {
        handleNestedCheckBoxSel(list, index, checked, child);
      }

      if (
        !checked &&
        ["is_write", "is_update", "is_read", "is_delete"].includes(name)
      ) {
        let subIndex = list[index].children.findIndex(
          (x: any) => x.id === child.id
        );
        if (subIndex != -1) {
          list[index].children[subIndex][name] = checked;
          let item = list[index].children[subIndex];
          if (
            !item.is_write &&
            !item.is_update &&
            !item.is_read &&
            !item.is_delete
          ) {
            list[index].children[subIndex].is_checked = checked;
          }
          let is_child_checked = list[index].children.some(
            (x: any) => x.is_checked
          );
          list[index].is_checked = is_child_checked;
        }
      }

      if (
        !checked &&
        !["is_write", "is_update", "is_read", "is_delete"].includes(name)
      ) {
        handleNestedCheckBoxSel(list, index, checked, child);
      }
    }
    setParams({ ...params, list: list });
  };

  const onRowEdit = (row: any) => {
    let options = [...modules] as any;
    options = options
      .filter((x: any) => x.parent_id == null)
      .map((x: any) => {
        let root_ele = row.permissions.find((y: any) => y.module_id === x.id);
        x["is_checked"] =
          root_ele?.is_read ||
          root_ele?.is_write ||
          root_ele?.is_delete ||
          root_ele?.is_update ||
          false;
        x["is_read"] = root_ele?.is_read || false;
        x["is_write"] = root_ele?.is_write || false;
        x["is_delete"] = root_ele?.is_delete || false;
        x["is_update"] = root_ele?.is_update || false;

        x["children"] = modules
          .filter((y: any) => y.parent_id === x.id)
          .map((z: any) => {
            let child_ele = row.permissions.find(
              (y: any) => y.module_id === z.id
            );
            z["is_checked"] =
              child_ele?.is_read ||
              child_ele?.is_write ||
              child_ele?.is_delete ||
              child_ele?.is_update ||
              false;
            z["is_read"] = child_ele?.is_read || false;
            z["is_write"] = child_ele?.is_write || false;
            z["is_delete"] = child_ele?.is_delete || false;
            z["is_update"] = child_ele?.is_update || false;
            return z;
          });
        return x;
      });

    setParams({
      ...params,
      list: options,
      name: row.name,
      role: row.is_manager ? "Manager" : "Executive",
      id: row.id,
    });
    setOpen(true);
  };

  const handleChange = (e: any) => {
    let temp = { ...params } as any;

    setErrors("" as any);
    let { name, value } = e.target;
    temp[name] = value;
    setParams(temp);
  };

  const addPermission = (array: any, list: any) => {
    array.push({
      module_id: list.id,
      is_read: list.is_read,
      is_write: list.is_write,
      is_update: list.is_update,
      is_delete: list.is_delete,
    });
    return array;
  };

  const handleSubmit = () => {
    const validationError = ValidateFields(params, {
      name: "required",
    });

    if (typeof validationError === "object") {
      setErrors(validationError);
      return;
    }

    const namePattern = /^[a-zA-Z0-9\s]+$/;
    if (!namePattern.test(params.name)){
      setErrors({...errors,name:'Invalid Role Name'})
      return
    }

    let is_checked = params.list.some((x: any) => x.is_checked);
    if (!is_checked) {
      showToastMessage("Please Select least one module!", "error");
      return;
    }

    let permissions = [] as any;
    let list: any;
    for (list of params.list) {
      if (list.is_checked) {
        permissions = addPermission(permissions, list);
        let children = list.children.filter((x: any) => x.is_checked);
        if (children.length) {
          for (let child of children) {
            permissions = addPermission(permissions, child);
          }
        }
      }
    }
    let payload = {
      name: params.name,
      is_manager: params.is_manager != "Executive",
      permissions: permissions,
    };
    setApiLoading(true);
    if (params.id) {
      axiosInstance
        .put(`/roles/${params.id}`, payload)
        .then((response) => {
          fetchData();
          setOpen(false);
          setApiLoading(false);
          showToastMessage("ROLE UPDATED SUCCESSFULLY", "success");
        })
        .catch((error) => {
          showToastMessage(error.message, "error");
          setApiLoading(false);
        });
    } else {
      axiosInstance
        .post(`roles`, payload)
        .then((response) => {
          fetchData();
          setOpen(false);
          showToastMessage("ROLE CREATED SUCCESSFULLY", "success");
          setApiLoading(false);
        })
        .catch((error) => {
          showToastMessage(error.message, "error");
          setApiLoading(false);
        });
    }
  };

  const fetchModules = () => {
    setIsLoading(true);
    axiosInstance
      .get(`roles/modules`)
      .then((res) => {
        setModules(res?.data?.data);
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    fetchData();
    fetchModules();
  }, []);

  const handleNewRole = () => {
    setParams({
      ...params,
      name: "",
      role: "Manager",
      id: "",
      is_manager: "Executive",
      list: [],
    });

    let options = [...modules] as any;
    options = options
      .filter((x: any) => x.parent_id == null)
      .map((x: any) => {
        x["is_checked"] = false;
        x["is_write"] = false;
        x["is_read"] = false;
        x["is_delete"] = false;
        x["is_update"] = false;
        x["children"] = modules
          .filter((y: any) => y.parent_id === x.id)
          .map((z: any) => {
            z["is_read"] = false;
            z["is_write"] = false;
            z["is_delete"] = false;
            z["is_update"] = false;
            z["is_checked"] = false;
            return z;
          });
        return x;
      });
    setParams({
      ...params,
      name: "",
      id: "",
      list: options,
      is_manager: true,
      role: "Manager",
    });
    setOpen(true);
  };
  const onGridReady = (params: any) => {
    if (loggedUser && !checkModulePrivilegeAccess("roles", "is_update")) {
      params.columnApi.setColumnsVisible(["status"], false);
    }
  };

  return (
    <div className="">
      <div className="flex  justify-between flex-col sm:flex-row">
        <div>
          <p className="subheading">Roles List</p>
          <hr className="w-32 md:w-full line" />
          <p className="text-xs font-onestRegular mt-1 font-normal text-shadeDarkBlue">
            {metadata?.total} Roles
          </p>
        </div>
        {checkModulePrivilegeAccess("roles", "is_write") ? (
          <div className="flex h-9 mt-4 lg:mt-0 gap-4">
            <CustomButton
              loading={isLoading}
              handleClick={handleNewRole}
              text="Create Role"
              icon={<img src="/assets/icons/plusIcon.svg" alt="create" />}
              classes="bg-darkshadeBlue text-white w-fit px-8   py-2"
            />
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className="mt-6">
        <div className="ag-theme-alpine" style={{ height: "75vh" }}>
          <AgGridReact
            gridOptions={{
              autoSizeStrategy: {
                type: "fitGridWidth",
                defaultMinWidth: 100,
              },
            }}
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            onGridReady={onGridReady}
            paginationPageSize={20}
            overlayNoRowsTemplate={
              '<span class="ag-overlay-loading-center">Loading...</span>'
            }
          />
        </div>
      </div>

      <RoleModal
        submit={handleSubmit}
        handleClose={() => {
          setOpen(false);
        }}
        handleRootChange={handleRootChange}
        handleChildChange={handleChildChange}
        handleChange={handleChange}
        open={open}
        params={params}
        formErrors={errors}
        isApiLoading={isApiLoading}
        title={params.id ? "Update User Role" : "Add New User Role"}
      />
    </div>
  );
};

export default RolesListing;
