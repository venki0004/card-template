import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import moment from "moment";
import FileUploaderModal from "./FileUploaderModal";
import RecordModal from "./AddNewRecordModal";
import AddEmployeeModal from "./AddEmployeeModal";
import BulkImageModal from "./BulkImageModal";
import { Link } from "react-router-dom";
import {
  decryptAESKey,
  decryptServerData,
  encryptData,
} from "../../../../utils/encryption";
import { axiosInstance } from "../../../../utils/axios";
import {
  CountItems,
  checkModulePrivilegeAccess,
  showToastMessage,
} from "../../../../utils/helpers";
import CustomButton from "../../../../components/CustomButton";
import SelectInput from "../../../../components/SelectInput";
import Input from "../../../../components/Input";
import { DateRangePicker } from "../../../../components/DateRangePicker";
import { useSelector } from "react-redux";

const EmployeeListing = () => {
  const pageSize = 20;
  let paginationProps = {
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: pageSize,
  };

  const colDefs = [
    { field: "emp_id", headerName: "Employee Id" },
    { field: "name", headerName: "Name" },
    {
      field: "email",
      headerName: "Email",
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return params.data.email || "--";
      },
    },
    {
      field: "designation",
      headerName: "Designation",
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return params.data.designation || "--";
      },
    },
    {
      field: "department",
      headerName: "Department",
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return params.data.department || "--";
      },
    },
    {
      field: "primary_phone",
      headerName: "Phone",
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return params.data.primary_phone || "--";
      },
    },
    {
      field: "card_status",
      headerName: "Card Status",
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return (
          <div className="flex mt-1 items-center gap-3">
            {checkModulePrivilegeAccess("all-employees", "is_update") && (
              <Link
                to={`/admin/employees/all-employees/edit/${encryptData(
                  params?.data?.id
                )}`}
              >
                <img src="/assets/icons/userEditIcon.svg" alt="edit" />
              </Link>
            )}

            <Link
              to={`/admin/employees/all-employees/view/${encryptData(
                params?.data?.id
              )}`}
            >
              <img src="/assets/icons/viewIcon.svg" alt="viewIcon" />
            </Link>
          </div>
        );
      },
    },
  ] as any;

  let fields = {
    search: "",
    status: "",
    from: "",
    to: "",
  };
  const { clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [metaData, setMetaData] = useState({} as any);
  const [params, setParams] = useState(fields as any);

  const [open, setOpen] = useState({
    bulkImage: false,
    addEmployee: false,
    addRecord: false,
    fileUploader: false,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [api, setApi] = useState({
    grid: undefined,
    column: undefined,
  } as any);

  const onGridReady = (params: any) => {
    setApi({
      grid: params.api,
      column: params.columnApi,
    });
    params.columnApi.autoSizeAllColumns();
  };

  const handleDateRangeFilter = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    const sDate = moment(start).format("YYYY-MM-DD");
    const eDate = moment(end).format("YYYY-MM-DD");
    setParams({ ...params, from: sDate, to: eDate });
  };

  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: value });
  };

  const handleClose = (type: any) => {
    let temp: any = { ...open };
    temp[type] = false;
    setOpen(temp);
  };

  const handleOpen = (type: any) => {
    let temp: any = { ...open };
    temp[type] = true;
    setOpen(temp);
  };

  const handleAddRecord = () => {
    let temp: any = { ...open };
    temp["addEmployee"] = false;
    temp["addRecord"] = true;
    setOpen(temp);
  };

  const handleUploadFile = () => {
    let temp: any = { ...open };

    temp["addRecord"] = false;
    temp["fileUploader"] = true;
    setOpen(temp);
  };

  const ApplyFilter = () => {
    fetchData(params);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
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
            `/employees?page=${page}&search=${params?.search}&from=${params?.from}&to=${params?.to}&status=${params?.status}&type=1&size=${paginationProps?.paginationPageSize}`
          )
          .then(async (response) => {
            let resp = response.data.data;
            let list = resp.data;
            const key = await decryptAESKey(
              response.data.x_key,
              clientPrivateKey
            );
            for (let item of list) {
              item["name"] = await decryptServerData(item.name, key);
              item["designation"] = await decryptServerData(
                item.designation,
                key
              );
              item["department"] = await decryptServerData(
                item.department,
                key
              );
              item["primary_phone"] = await decryptServerData(
                item.primary_phone,
                key
              );
              item["email"] = await decryptServerData(item.email, key);
              item["emp_id"] = await decryptServerData(item.emp_id, key);
            }
            param.successCallback(list, resp.pagination?.total);
            setMetaData(resp.pagination);
            api.grid.setRowData([]);
            setTimeout(() => {
              api.column.autoSizeAllColumns();
              api.grid.hideOverlay();
              if (!resp.data.length) {
                api.grid.showNoRowsOverlay();
              }
            }, 100);
          })
          .catch((err) => {
            showToastMessage(err.message, "error");
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

  const downloadReport = () => {
    setIsLoading(true);
    axiosInstance
      .get(`/employees/report/download?type=1`)
      .then((response) => {
        showToastMessage("EMPLOYEE REPORT GENERATED SUCCESSFULLY", "success");
        setIsLoading(false);
        if (response.data.status) {
          const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data.base64String}`;
          const downloadLink = document.createElement("a");
          const fileName = `employee_report.xlsx`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        showToastMessage(err.message, "error");
      });
  };

  return (
    <div className="">
      <div className="flex  justify-between flex-col sm:flex-row">
        <div>
          <p className="subheading">List of Employees</p>
          <hr className="w-32 md:w-full line" />
          <p className="text-xs font-onestRegular mt-1 font-normal text-shadeDarkBlue">
            {metaData?.total} Employees
          </p>
        </div>
        <div className=" flex-none h-9 flex mt-4 lg:mt-0 gap-4 filters">
          <CustomButton
            handleClick={downloadReport}
            loading={isLoading}
            text="Download Report"
            classes="bg-darkshadeBlue text-white w-fit px-6"
          />

          <CustomButton
            handleClick={() => {
              setFilterOpen(!filterOpen);
            }}
            text="Filter"
            icon={
              <img
                src="/assets/icons/filterIcon.svg"
                alt=""
                className="w-1/2"
              />
            }
            classes="bg-none border border-black text-black w-fit px-4"
          />
          {checkModulePrivilegeAccess("all-employees", "is_update") ? (
            <>
              <CustomButton
                handleClick={() => {
                  handleOpen("bulkImage");
                }}
                text="Bulk Image Upload"
                classes="bg-none border border-black text-black w-fit px-4"
              />
              <CustomButton
                handleClick={() => {
                  handleOpen("addEmployee");
                }}
                text="Add Employee"
                icon={<img src="/assets/icons/plusIcon.svg" alt="plus" />}
                classes="bg-darkshadeBlue text-white w-fit px-6"
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      {filterOpen ? (
        <div className="w-full flex flex-col lg:flex-row gap-4 items-center mt-4 filters">
          <div className="w-full lg:w-2/12">
            <SelectInput
              width="100%"
              options={[
                {
                  name: "REQUESTED",
                },
                {
                  name: "NOT_REQUESTED",
                },
                {
                  name: "DISABLE",
                },
                {
                  name: "ACTIVE",
                },
              ]}
              handleChange={handleFilterChange}
              value={params?.status}
              label="Status"
              name="status"
            />
          </div>{" "}
          <DateRangePicker
            label={"Date Created"}
            onChange={handleDateRangeFilter}
            startDate={startDate}
            endDate={endDate}
          />
          <div className="w-full lg:w-3/12">
            <Input
              rows={1}
              width="w-full"
              disabled={false}
              readOnly={false}
              value={params?.search}
              handleChange={handleFilterChange}
              label="Search"
              name="search"
            />
          </div>
          <div className="w-full lg:w-3/12 flex pl-6 justify-end lg:justify-start items-center gap-2">
            <CustomButton
              disabled={CountItems(params) < 1}
              handleClick={ApplyFilter}
              text="Apply"
              classes="bg-darkshadeBlue text-white w-fit px-4 py-2"
            />

            <button
              disabled={CountItems(params) < 1}
              className={`w-fit px-2 py-1 border ${
                CountItems(params) >= 1
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
        <div className="ag-theme-alpine" style={{ height: "70vh" }}>
          <AgGridReact
            rowModelType={"infinite"}
            columnDefs={colDefs}
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
      <AddEmployeeModal
        open={open?.addEmployee}
        handleClose={() => {
          handleClose("addEmployee");
        }}
        handleAddRecord={handleAddRecord}
      />

      <RecordModal
        open={open?.addRecord}
        handleClose={() => {
          handleClose("addRecord");
        }}
        handleUploadFile={handleUploadFile}
      />

      <FileUploaderModal
        open={open?.fileUploader}
        handleClose={() => {
          handleClose("fileUploader");
        }}
        refresh={() => fetchData(params)}
      />

      <BulkImageModal
        open={open?.bulkImage}
        handleClose={() => {
          handleClose("bulkImage");
        }}
      />
    </div>
  );
};

export default EmployeeListing;
