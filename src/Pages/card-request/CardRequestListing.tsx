import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import moment from "moment";
import { Link } from "react-router-dom";
import { decryptAESKey, decryptServerData, encryptData } from "../../utils/encryption";
import { CountItems, showToastMessage } from "../../utils/helpers";
import CustomButton from "../../components/CustomButton";
import { DateRangePicker } from "../../components/DateRangePicker";
import SelectInput from "../../components/SelectInput";
import { axiosInstance } from "../../utils/axios";
import Input from "../../components/Input";
import { useSelector } from "react-redux";

const CardRequestListing = () => {
  const { clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  const pageSize = 20;
  let paginationProps = {
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: pageSize,
  };

  const columnDefs = [
    { field: "emp_id", headerName: "Employee ID" },
    {
      field: "name",
      headerName: "Employee Name",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return params?.data?.name || "--";
      },
    },
    {
      field: "created_at",
      headerName: "Date of Request",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return moment(params?.data?.created_at).format("DD/MM/yy");
      },
    },
    {
      field: "dispatched_date",
      headerName: "Date of Dispatch",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return params?.data?.dispatched_date
          ? moment(params?.data?.dispatched_date).format("DD/MM/yy")
          : "-";
      },
    },

    {
      field: "card_status",
      headerName: "Card Status",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return (
          <p
            className={`${
              params?.data?.card_print_status === "PENDING"
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {params?.data?.card_print_status}
          </p>
        );
      },
    },

    {
      field: "action",
      headerName: "Action",
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        return (
          <div className="flex justify-start items-center mt-1">
            <Link
              to={`/admin/card-requests/view/${encryptData(params?.data?.id)}`}
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
    dispatched_from: "",
    dispatched_to: "",
    status: "",
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [metaData, setMetaData] = useState({} as any);
  const [params, setParams] = useState(fields);
  const [api, setApi] = useState({
    grid: undefined,
    column: undefined,
  } as any);

  const handleChange = (e: any) => {
    let { value, name } = e.target;
    let temp = { ...params } as any;
    temp[name] = value;
    setParams(temp);
  };

  const onGridReady = (params: any) => {
    setApi({
      grid: params.api,
      column: params.columnApi,
    });
    params.columnApi.sizeColumnsToFit();
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
            `card-requests?search=${params?.search}&status=${params.status}&page=${page}&dispatched_from=${params?.dispatched_from}&dispatched_to=${params?.dispatched_to}&size=${pageSize}`
          )
          .then(async (response) => {
            let resp = response.data.data;
            const  key = await decryptAESKey(response.data.x_key,clientPrivateKey)
            let list = resp.data
            for(let item of list) {
              item['name'] = await decryptServerData(item.name,key)
              item['designation'] = await decryptServerData(item.designation,key)
              item['department'] = await decryptServerData(item.department,key)
              item['emp_id'] = await decryptServerData(item.emp_id,key)
            }
            param.successCallback(list, resp.pagination?.total);
            setMetaData(resp.pagination);
            api.grid.setRowData([]);
            setTimeout(() => {
              api.column.sizeColumnsToFit();
              api.grid.hideOverlay();
              if (!resp.data.length) {
              api.grid.hideOverlay();
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

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDateRangeFilter = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    const sDate = moment(start).format("YYYY-MM-DD");
    const eDate = moment(end).format("YYYY-MM-DD");
    setParams({ ...params, dispatched_from: sDate, dispatched_to: eDate });
  };

  const applyFilter = () => {
    fetchData(params);
  };

  const handleResetFilters = () => {
    setParams(fields);
    fetchData(fields);
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="">
      <div className="flex  justify-between flex-col sm:flex-row">
        <div>
          <p className="subheading">Card Request</p>
          <hr className="w-32 md:w-full line" />
          <p className="text-xs font-onestRegular mt-1 font-normal text-shadeDarkBlue">
            {metaData.total} Cards
          </p>
        </div>
        <div className=" flex-none h-9 flex mt-4 lg:mt-0 gap-4 filters">
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
        </div>
      </div>

      {filterOpen ? (
        <div className="w-full flex flex-col lg:flex-row gap-4 items-center mt-4 filters">
          <div className="w-full lg:w-2/12">
            <SelectInput
              width="100%"
              options={[
                {
                  name: "NOT_PRINTED",
                },
                {
                  name: "PRINTED",
                },
                {
                  name: "DISPATCHED",
                },
              ]}
              handleChange={handleChange}
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

export default CardRequestListing;
