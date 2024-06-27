import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Toggle from "../../../components/Toggle";
import moment from "moment";
import { Link } from "react-router-dom";
import { decryptAESKey, decryptServerData, encryptData } from "../../../utils/encryption";
import {
  CountItems,
  checkModulePrivilegeAccess,
  showToastMessage,
} from "../../../utils/helpers";
import CustomButton from "../../../components/CustomButton";
import SelectInput from "../../../components/SelectInput";
import { axiosInstance } from "../../../utils/axios";
import Input from "../../../components/Input";
import { getLoggedInUser } from "../../../utils/auth";
import { useSelector } from "react-redux";
let paginationProps = {
  pagination: true,
  paginationPageSize: 10,
  cacheBlockSize: 10,
};
const UserListing = () => {

  const { clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  const [metaData, setMetaData] = useState({} as any);

  const columnDefs = [
    { headerName: "User ID", field: "id", width: 100 },
    { headerName: "Name", field: "name" },
    { headerName: "Email ID", field: "email" },
    { headerName: "Contact Number", field: "phone", width: 150 },
    {
      headerName: "Role",
      field: "role_id",
      width: 100,
      cellRenderer: (params: any) =>
        roles.map((item: any) => (item?.id === params.value ? item?.name : "")),
    },
    {
      headerName: "User Status",
      field: "is_active",
      cellRenderer: (params: any) => {
        return (
          <div className="">
            <Toggle
              name=""
              ischecked={params?.data?.is_active === 1}
              handleCheck={(e: any) => {
                handleToggleChange(e, params);
              }}
            />
          </div>
        );
      },
      width: 150,
      suppressMenu: true,
      sortable: false,
      filter: false,
    },
    {
      headerName: "Created On",
      field: "created_at",
      width: 180,
      cellRenderer: (params: any) =>
        params.value ? moment(params?.value).format("h:mm A; DD/M/yy") : "--",
    },

    {
      headerName: "Actions",
      field: "status",
      cellRenderer: (params: any) => {
        return (
          <div className="flex mt-1 items-center gap-3">
            {checkModulePrivilegeAccess("users", "is_update") ? (
              <Link
                to={`/admin/user-settings/users/edit/${encryptData(
                  params?.data?.id
                )}`}
              >
                <img src="/assets/icons/userEditIcon.svg" alt="edit" />
              </Link>
            ) : (
              <></>
            )}

            <Link
              to={`/admin/user-settings/users/view/${encryptData(
                params?.data?.id
              )}`}
            >
              <img src="/assets/icons/viewIcon.svg" alt="viewIcon" />
            </Link>
          </div>
        );
      },
      width: 100,
      suppressMenu: true,
      sortable: false,
      filter: false,
    },
  ] as any;

  let fields = {
    search: "",
    role: "",
    status: "",
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [params, setParams] = useState(fields);
  const [roles, setRoles] = useState([] as any);
  const loggedUser = getLoggedInUser();

  const [api, setApi] = useState({
    grid: undefined,
    column: undefined,
  } as any);

  const onGridReady = (params: any) => {
    setApi({
      grid: params.api,
      column: params.columnApi,
    });
    if (loggedUser && !checkModulePrivilegeAccess("users", "is_update")) {
      params.columnApi.setColumnsVisible(["is_active"], false);
    }
    params.columnApi.autoSizeAllColumns();
  };

  const handleToggleChange = (e: any, params: any) => {
    axiosInstance
      .patch(`users/${params.data.id}`, {
        status: e.target.checked,
      })
      .then((res: any) => {
        showToastMessage(res?.data?.message, "success");
        const rowNode = params.node;
        if (rowNode) {
          rowNode.setDataValue("is_active", e.target.checked ? 0 : 1);
        }
      })
      .catch((error: any) => {
        showToastMessage(error.message, "error");
      })
      .finally(() => { });
  };


  const fetchRoles = () => {
    axiosInstance
      .get(`roles/dropdown`)
      .then((res: any) => {
        setRoles(res?.data?.data);
      })
      .catch((error: any) => {
        showToastMessage(error.message, "error");
      });
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleChange = (e: any) => {
    let { value, name } = e.target;
    let temp = { ...params } as any;
    temp[name] = value;
    setParams(temp);
  };

  const applyFilter = () => {
    fetchData(params);
  };

  const handleResetFilters = () => {
    setParams(fields);
    fetchData(fields);
  };

  useEffect(() => {
    if (api.grid) {
      fetchData(params);
    }
  }, [api.grid]);

  const fetchData = (params: any) => {
    const dataSource = {
      getRows: (param: any) => {
        setTimeout(() => {
          api.grid.showLoadingOverlay();
          api.grid.setRowData([]);
        }, 100);
        const page = param.endRow / paginationProps.paginationPageSize;
        axiosInstance
          .get(
            `users?search=${params?.search}&page=${page}&role=${params?.role}&status=${params?.status}`
          )
          .then(async (response) => {
            let resp = response.data.data;
            const  key = await decryptAESKey(response.data.x_key,clientPrivateKey)
            let list = resp.data
            for(let item of list) {
              item['name'] = await decryptServerData(item.name,key)
              item['phone'] = await decryptServerData(item.phone,key)
            }
            param.successCallback(list, resp.pagination?.total);
            setMetaData(resp.pagination);
            api.grid.setRowData([]);
            setTimeout(() => {
              if(checkModulePrivilegeAccess("users", "is_update")){
                api.column.autoSizeAllColumns();
              } else {
              api.column.sizeColumnsToFit();

              }
              api.grid.hideOverlay();
              if (!resp.data.length) {
                api.grid.showNoRowsOverlay();
              }
            }, 100);
          })
          .catch((err) => {
            showToastMessage(err.message, 'error')
            param.successCallback([], 0);
          });
      },
    };
    if (api.grid) api.grid.setDatasource(dataSource);
  };

  const onFirstDataRendered = () => {
    if (api.column) {
      api.column.autoSizeAllColumns();
    }
  };

  return (
    <div className="">
      <div className="flex  justify-between flex-col sm:flex-row">
        <div>
          <p className="subheading">List of Users</p>
          <hr className="w-32 md:w-full line" />
          <p className="text-xs mt-1 font-normal">{metaData?.total} Users</p>
        </div>
        <div className="flex mt-4 h-9 lg:mt-0 gap-4">
          <CustomButton
            handleClick={() => {
              setFilterOpen(!filterOpen);
            }}
            text="Filter"
            icon={<img src="/assets/icons/filterIcon.svg" alt="" />}
            classes="bg-none border border-black text-black w-fit px-4  py-2"
          />
          {
            checkModulePrivilegeAccess("users", "is_write") ? (
              <Link to="/admin/user-settings/users/create">
                <CustomButton
                  text="Create New User"
                  icon={<img src="/assets/icons/plusIcon.svg" alt="plus" />}
                  classes="bg-darkshadeBlue text-white w-fit px-8  py-2"
                />
              </Link>
            ) : <></>
          }

        </div>
      </div>
      {filterOpen ? (
        <div className="w-full flex flex-col lg:flex-row gap-4 items-center  mt-4  filters">
          <div className="w-full lg:w-2/12">
            <SelectInput
              width="100%"
              options={roles || []}
              value={params?.role}
              handleChange={handleChange}
              label="Role"
              name="role"
            />
          </div>
          <div className="w-full lg:w-2/12">
            <SelectInput
              width="100%"
              options={[
                { id: true, name: "ACTIVE" },
                { id: false, name: "DISABLED" },
              ]}
              handleChange={handleChange}
              value={params?.status}
              label="Status"
              name="status"
            />
          </div>

          <div className="w-full lg:w-3/12">
            <Input
              rows={1}
              width="w-full"
              disabled={false}
              readOnly={false}
              value={params?.search}
              handleChange={handleChange}
              label="Search"
              name="search"
            />
          </div>

          <div className="w-full lg:w-3/12 flex pl-6 justify-end lg:justify-start items-center gap-2">
            <CustomButton
              disabled={CountItems(params) < 1}
              handleClick={applyFilter}
              text="Apply"
              classes="bg-darkshadeBlue text-white w-fit px-4  py-2"
            />

            <button
              disabled={CountItems(params) < 1}
              className={`w-fit px-2 py-1 border ${CountItems(params) >= 1
                  ? "border-black cursor-pointer"
                  : "border-[#bbbbbb]"
                }  `}
              onClick={handleResetFilters}
            >
              <img
                src={
                  CountItems(params) >= 1
                    ? "/assets/icons/refreshIcon.svg"
                    : "/assets/icons/disableReset.svg"
                }
                alt=""
              />
            </button>
          </div>
        </div>
      ) : null}
      <div className="mt-6">
        <div
          className="ag-theme-alpine"
          style={{ height: "65vh", width: "100%" }}
        >
          <AgGridReact
            rowModelType={"infinite"}
            columnDefs={columnDefs}
            onGridReady={onGridReady}
            enableCellTextSelection={true}
            ensureDomOrder={true}
            onFirstDataRendered={onFirstDataRendered}
            gridOptions={{
              defaultColDef: {
                maxWidth: 500,
              },
            }}
            {...paginationProps}
          />
        </div>
      </div>
    </div>
  );
};

export default UserListing;
