import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import PropTypes from "prop-types";
import { DialogTitle } from "@mui/material";
import FileUpload from "../../../../components/FileUpload";
import CustomButton from "../../../../components/CustomButton";
import { axiosInstance } from "../../../../utils/axios";
import Validator from "validatorjs";
import { showToastMessage } from "../../../../utils/helpers";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import StatusChip from "../../../../components/StatusChip";

const pagination = true;
const paginationPageSize = 7;
const paginationPageSizeSelector = [7, 14, 21];
const columnDefs = [
  { field: "file_name", headerName: "File Name" },
  { field: "employee_id", headerName: "EmpId" },
  { field: "email", headerName: "Email" },
  { field: "reason", headerName: "Remark" },
  {
    field: "status",
    headerName: "Status",
    cellRenderer: (params: any) => {
      if (!params.data) return null;
      return (
        <div>
          <StatusChip
            label={params.data.status === "SUCCESS" ? "SUCCESS" : "FAILED"}
            variant={params.data.status === "SUCCESS" ? 0 : 1}
          />
        </div>
      );
    },
  },
]
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    backgroundColor: "#FFFFFF",

    width: "100%",
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function BulkImageModal({ open, handleClose }: any) {
  const [errors, setErrors] = useState({
    file: "",
  } as any);

  const [params, setParams] = useState({ file: "" } as any);
  const [isLoading, setIsLoading] = useState(false);

  const onGridReady = (params: any) => {
    params.columnApi.autoSizeAllColumns();
  };

  const handleChange = (e: any) => {
    if (e?.target) {
      const { name, value } = e.target;
      setErrors({
        ...errors,
        [name]: "",
      });
      setParams({
        ...params,
        [name]: value,
      });
    }

    if (e?.file) {
      setErrors({
        ...errors,
        file: "",
      });

      setParams({
        ...params,
        file: e?.url,
      });
      setZipFile(e.file);
    }
  };

  const removeFile = () => {
    setParams({
      ...params,
      file: "",
    });
  };

  const validate = (parameters: any, rule: any) => {
    const validator = new Validator(parameters, rule);

    if (validator.fails()) {
      const fieldErrors = {} as any;

      /* eslint-disable */
      for (const key in validator.errors.errors) {
        fieldErrors[key] = validator.errors.errors[key][0];
      }
      /* eslint-enable */

      setErrors(fieldErrors);

      return false;
    }
    // setErrors({
    //   ...errors,
    //   file: "",
    // });
    return true;
  };

  
  const [zipFile, setZipFile] = useState() as any;
  const [isProcessed, setIsProcessed] = useState(false);

  const [zipRowData, setZipRowData] = useState([]) as any;

  const handleSubmit = () => {
    let rules = {
      file: "required",
    };

    if (!validate(params, rules)) {
      const err = Object.keys(errors);
      if (err?.length) {
        const input = document.querySelector(`input[name=${err[0]}]`);
      }
      return;
    }

    const payload = {
      file: params.file,
      employee_id: 1,
    }
    setIsLoading(true)
    axiosInstance
      .post("/employees/bulk-image-upload", payload)
      .then((response) => {
        showToastMessage("Zip file uploaded successfully", "success");
        let data = response.data;
        setZipRowData(data.list);
        setIsProcessed(true);
        setIsLoading(false)
      })
      .catch((error: any) => {
        showToastMessage(error.message ?? "Unable to upload file", 'error')
        setIsLoading(false)
      });
  };

  const onCloseClick = () => {

    handleClose();
    setZipRowData([]);
    setIsProcessed(false);
    setParams({
      file: "",
    });
    setZipFile();
    setIsLoading(false)
  };

  return (
    <div className="w-full">
      <BootstrapDialog
        onClose={onCloseClick}
        aria-labelledby="customized-dialog-title"
        open={open}
        PaperProps={{
          sx: {
            minWidth: {
              xs: "90%",
              sm: "60%",
              md: "800px",
              lg: "600px",
              xl: "600px",
            },
            m: 1,
            alignItems: "center",
            borderRadius: "0px",
          },
        }}
      >
        <DialogTitle sx={{ width: "100%" }}>
          <div className="flex justify-between ">
            <p
              className="text-left  font-bold text-lg  text-shadeDarkBlue"
              id="modal-headline"
            >
              Bulk Image Upload
            </p>

            <button onClick={onCloseClick}>
              {" "}
              <img
                src="/assets/icons/closeIcon.svg"
                className="cursor-pointer"
                alt="close_icon"
              />
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          {isProcessed ? (
            <div>
              <div
                className="ag-theme-alpine" // applying the grid theme
                style={{ height: 350 }} // the grid will fill the size of the parent container
              >
                <AgGridReact
                  suppressDragLeaveHidesColumns={true}
                  gridOptions={{
                    paginationAutoPageSize: true,
                    pagination: true,
                    autoSizeStrategy: {
                      type: "fitGridWidth",
                      defaultMinWidth: 150,
                    },
                  }}
                  rowData={zipRowData}
                  columnDefs={columnDefs}
                  pagination={pagination}
                  paginationPageSize={paginationPageSize}
                  paginationPageSizeSelector={paginationPageSizeSelector}
                  onGridReady={onGridReady}
                />
              </div>

              <div className="w-full pt-4 flex justify-end">
                <CustomButton
                  handleClick={onCloseClick}
                  text="Submit"
                  classes="bg-darkBlue text-white px-10 py-2"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="w-full gradientBg">
                <FileUpload
                  removeImage={removeFile}
                  imageUrl={params?.file}
                  styleType={"lg"}
                  setImage={handleChange}
                  acceptMimeTypes={[
                    "application/x-zip-compressed",
                    "application/zip",
                    "application/x-rar-compressed",
                  ]}
                  title="Upload or Drag and Drop image"
                  label="File Format: .zip"
                  id="file"
                  maxSize={10}
                  filename="file"
                  error={errors?.file}
                  helperText={errors.file}
                />
              </div>

              <div className="w-full pt-4 flex justify-end">
                <CustomButton
                  disabled={isLoading}
                  loading={isLoading}
                  handleClick={handleSubmit}
                  text="Upload"
                  classes="bg-darkBlue text-white px-10 py-2"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
}

BulkImageModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
