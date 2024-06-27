import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import CustomButton from "../../../../components/CustomButton";
import { axiosInstance } from "../../../../utils/axios";
import {
  checkModulePrivilegeAccess,
  showToastMessage,
} from "../../../../utils/helpers";
import CardStatusUpdateModal from "./CardStatusUpdate";
const pageSize = 20;

const CardListing = ({ id }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [isOpenCardStatusModal, setIsOpenCardStatusModal] = useState(false);

  let paginationProps = {
    pagination: true,
    paginationPageSize: pageSize,
    cacheBlockSize: pageSize,
  };

  const openStatusUpdateModal = (data: any) => {
    setSelectedItem(data);
    setIsOpenCardStatusModal(true);
  };
  const columnDefs = [
    { field: "index", headerName: "Sn. No", width: 100 },
    {
      field: "card_uuid",
      width: 300,
      headerName: "Card Id",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return params.data?.card_uuid || "-";
      },
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return params.data?.card_status;
      },
    },

    {
      field: "action",
      headerName: "Action",
      width: 250,
      cellRenderer: (params: any) => {
        if (!params.data) return null;
        if (params.data.card_status === "DISABLED") return <>--</>;
        return params.data.card_print_status === "DISPATCHED" ? (
          <div className="flex h-full justify-between gap-4 items-center">
            <CustomButton
              loading={isLoading}
              handleClick={() => openStatusUpdateModal(params.data)}
              text="Update"
              classes="bg-darkBlue px-20 py-2 text-white"
            />
          </div>
        ) : (
          <div>
            <p>Card Not printed!.</p>
          </div>
        );
      },
    },
    {
      field: "remark",
      headerName: "Remark",
      cellRenderer: (params: any) => {
        if (!params.data) return;
        return params.data?.remark || "--";
      },
    },
  ] as any;

  const fetchData = () => {
    setIsLoading(true);
    axiosInstance
      .get(`/employees/cards/${id}`)
      .then((res: any) => {
        let list = res.data.data.map((item: any, index: number) => {
          item["index"] = index + 1;
          return item;
        });
        setRowData(list);
        setIsLoading(false);
      })
      .catch((error: any) => {
        setIsLoading(false);
        showToastMessage(error.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onGridReady = (params: any) => {
    if (!checkModulePrivilegeAccess("distributors", "is_update")) {
      params.columnApi.setColumnsVisible(["action"], false);
    }
    params.columnApi.sizeColumnsToFit();
  };

  return (
    <div className="">
      {isLoading ? (
        <div className="h-full flex justify-center items-center">
          <p className="px-4 py-2 shadow border text-sm">Loading...</p>
        </div>
      ) : rowData.length > 0 ? (
        <div className="ag-theme-alpine">
          <div
            className="ag-theme-alpine"
            style={{ height: "400px", width: "100%" }}
          >
            <AgGridReact
              columnDefs={columnDefs}
              rowData={rowData}
              {...paginationProps}
              onGridReady={onGridReady}
              overlayNoRowsTemplate={
                '<span class="ag-overlay-loading-center">Loading...</span>'
              }
            ></AgGridReact>
          </div>

          <CardStatusUpdateModal
            selectedItem={selectedItem}
            open={isOpenCardStatusModal}
            handleClose={() => setIsOpenCardStatusModal(false)}
            refresh={fetchData}
          />
        </div>
      ) : (
        <div className=" flex items-center justify-center h-[40vh] w-full">
          <p>No Cards Found !</p>
        </div>
      )}
    </div>
  );
};

export default CardListing;
