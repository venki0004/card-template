import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { useState } from "react";
import PropTypes from "prop-types";
import { DialogTitle } from "@mui/material";
import FileUpload from "../../../../components/FileUpload";
import CustomButton from "../../../../components/CustomButton";

import Excel from "exceljs";
import { AgGridReact } from "ag-grid-react";
import Validator from "validatorjs";
import { axiosInstance } from "../../../../utils/axios";
import { showToastMessage, validatePhoneNumber } from "../../../../utils/helpers";
import { encryptAESKey, encryptServerDataUsingKey, generateAESKey } from "../../../../utils/encryption";
import { useSelector } from "react-redux";
const templateColumns = [
  "Sno",
  "EmployeeId",
  "EmployeeName",
  "EmployeeEmail",
  "EmployeeDesignation",
  "EmployeeDepartment",
  "EmployeePrimaryPhone",
  "EmployeeWhatsappNo",
  "WorkLocation",
  "BloodGroup",
  "MF/Alternates",
  "Access Card Enabled",
  "Designation&Dept Printed on Business Card"
];
const columnMapping: { [key: string]: string } = {
  "EmployeeId": "emp_id",
  "EmployeeName": "name",
  "EmployeeEmail": "email",
  "EmployeeDesignation": "designation",
  "EmployeeDepartment": "department",
  "EmployeePrimaryPhone": "primary_phone",
  "EmployeeWhatsappNo": "whatsapp_number",
  "WorkLocation": "work_location",
  "BloodGroup": "blood_group",
  "MF/Alternates": "card_type",
  "Access Card Enabled": "is_access_card_enabled",
  "Designation&Dept Printed on Business Card": "is_print_dept_designation",
};

const colDefs = [
  {
    field: "emp_id",
    headerName: "emp_id",
  },

  {
    field: "email",
    headerName: "email",
  },

  {
    field: "status",
    headerName: "status",
  },

  {
    field: "remark",
    headerName: "remark",
  },
];
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    backgroundColor: "#FFFFFF",

    width: "100%",
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const pagination = true;
const paginationPageSize = 20;
const paginationPageSizeSelector = [20, 50, 100];
export default function FileUploaderModal({ open, handleClose,refresh }: any) {

  const { serverPublicKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  
  const [params, setParams] = useState({ file: "" } as any);
  const [errors, setErrors] = useState({ file: "" } as any);
  const [isLoading, setIsLoading] = useState(false);

  const onGridReady = (params: any) => {
    params.columnApi.autoSizeAllColumns();
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
    setErrors({
      ...errors,
      photo_naming_method: "",
      file: "",
      device: "",
    });
    return true;
  };

  const [isProcessed, setIsProcessed] = useState(false);
  const [sheetValidationErrors, setSheetValidationErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedRecords, setUploadedRecords] = useState([]) as any;
  const [rowData, setRowData] = useState([]) as any;

  const handleUploadAndProcessFile = (e: any) => {
    setErrors({
      file: "",
    });
    setParams({
      ...params,
      file: e?.file.name,
    });
    setIsProcessing(true);
    const file = e?.file;
    const wb = new Excel.Workbook();
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = reader.result as any;

      wb.xlsx.load(buffer).then((workbook) => {
        const worksheet = workbook.worksheets[0];
        const firstRow: any = worksheet.getRow(1);
        let columnsMatch = true;
        if (firstRow?.values && firstRow.values.length) {
          for (let i = 0; i < templateColumns.length; i++) {
            if (!firstRow.values.includes(templateColumns[i])) {
              columnsMatch = false;
              break;
            }
          }
        } else {
          columnsMatch = false;
        }
        if (columnsMatch) {
          let jsonData = [] as any;
          workbook.eachSheet((sheet, id) => {
            let firstRow = sheet.getRow(1);
            if (!firstRow.cellCount) return;
            let keys = firstRow.values as any;
            sheet.eachRow((row, rowNumber) => {
              if (rowNumber == 1) return;
              let values = row.values as any;
              let obj = {} as any;
              for (let i = 1; i < keys.length; i++) {
                let templateColumn = keys[i];
                let backendColumn = columnMapping[templateColumn];
                if (backendColumn) {
                  obj[backendColumn.toLowerCase()] =  values[i] ? String(values[i]) : '';
                }
              }
              jsonData.push(obj);
            });
          });

          const duplicateEmails: any = [];
          const inValidPhone: any = [];
          const duplicateIDs: any = [];
          for (let i = 0; i < jsonData.length; i++) {
            const currentRecord: any = jsonData[i];

            if(currentRecord.primary_phone && !validatePhoneNumber(String(currentRecord.primary_phone).trim())) {
              inValidPhone.push({
                message: `Invalid primary phone number ${i + 1} th row  Phone: ${currentRecord.primary_phone}`,
                phone: currentRecord.primary_phone,
                type:'Primary Phone Number'
              });
            }
           
            if(currentRecord.whatsapp_number && !validatePhoneNumber(String(currentRecord.whatsapp_number).trim())) {
              inValidPhone.push({
                message: `Invalid whatsapp number ${i + 1} th row  Phone: ${currentRecord.whatsapp_number}`,
                phone: currentRecord.whatsapp_number,
                type:'Whatsapp Number'
              });
            }
            for (let j = i + 1; j < jsonData.length; j++) {
              const otherRecord = jsonData[j];

              if (currentRecord.email && currentRecord.email === otherRecord.email) {
                duplicateEmails.push({
                  message: `Duplicate Email found ${j + 1} th row  Email: ${currentRecord.email}`,
                  email: currentRecord.email,
                  type:'Email'
                });
              }
              if (currentRecord.emp_id && currentRecord.emp_id === otherRecord.emp_id) {
                duplicateIDs.push({
                  message: `Duplicate Employee Id found ${j + 1} th row  Employee Id: ${currentRecord.emp_id}`,
                  id: currentRecord.emp_id,
                  type:'Employee Id'
                });
              }
            }
          }

          if (!jsonData.length) {
            showToastMessage("Empty Sheet Uploaded.", "error");
            setIsProcessing(false);
            setParams({
              file: "",
            });
            return;
          }

          if (duplicateEmails.length || duplicateIDs.length || inValidPhone.length) {
            let errors: any = [...duplicateEmails, ...duplicateIDs,...inValidPhone];
            setSheetValidationErrors(errors);
          } else {
            setUploadedRecords(jsonData);
          }
        } else {
          showToastMessage("Invalid Template File uploaded!.", "error");
          setParams({
            file: "",
          });
        }

        setIsProcessing(false);
      });
    };
  };

  const removeFile = () => {
    setParams({
      file: "",
    });
  };

  const bulkUploadApi = async () => {
    
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

    if(!uploadedRecords.length) {
      showToastMessage('Please upload the file!', "error");
      return
    }

    let aesKey = await generateAESKey()
    let encryptKey = await encryptAESKey(aesKey,serverPublicKey)
     let employeesList  = uploadedRecords.map((item: any) => {
      return {
        ...item,
        email:
          typeof item.email === "object"
            ? String(item?.email?.text)
            : String(item?.email),
      };
    })
    for(let ele of employeesList){
      const encryptionPromises = [
        'name', 'designation', 'department', 'primary_phone',
        'email', 'emp_id', 'whatsapp_number', 'blood_group'
      ].map(async (property) => {
        if (ele[property]) {
          ele[property] = await encryptServerDataUsingKey(ele[property],aesKey)
        }
      });
      
      await Promise.all(encryptionPromises);
    }

    setIsLoading(true)
    axiosInstance
      .post("/employees/bulk-upload-employees", {
        employees: employeesList,
        employee_type: 1,
      },{ headers: {'Encrypted-Key': encryptKey}})
      .then((response) => {
        setRowData(response?.data?.response_list);
        setIsProcessed(true);
        setIsLoading(false)
        showToastMessage("Sheet Uploaded successfully!.", "success");
        refresh();
      })
      .catch((error: any) => {
        showToastMessage(error.message, "error");
        setIsLoading(false)
      });
  };

  //clean up when modal closes
  const onCloseClick = () => {
    handleClose();
    setRowData([]);
    setIsProcessed(false);
    setIsProcessing(false);
    setSheetValidationErrors([]);
    setUploadedRecords([]);
    removeFile();
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
              Add New Record
            </p>

            <button onClick={onCloseClick}>
              <img
                src="/assets/icons/closeIcon.svg"
                className="cursor-pointer"
                alt="close_icon"
              />
            </button>
          </div>
        </DialogTitle>
        <DialogContent>
          {!isProcessed && !sheetValidationErrors.length && (
            <div>
              <div className="w-full gradientBg">
                <FileUpload
                  removeImage={removeFile}
                  imageUrl={params?.file}
                  styleType={"lg"}
                  setImage={handleUploadAndProcessFile}
                  acceptMimeTypes={[
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  ]}
                  title="Upload or Drag and Drop XLS file"
                  label="File Format: .xslx/.xsl"
                  id="file"
                  maxSize={5}
                  filename="file"
                  error={errors?.file}
                  type="xslx"
                />
              </div>

              <div className="w-full pt-4 flex justify-end">
                <CustomButton
                 disabled={isProcessing || isLoading}
                 loading={isLoading}
                  handleClick={bulkUploadApi}
                  text="Upload"
                  classes="bg-darkBlue rounded-lg text-white px-10 py-2"
                />
              </div>
            </div>
          )}
          {sheetValidationErrors.length ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1377 2.93692L23.516 17.4486C23.8233 17.9808 23.9999 18.5978 23.9999 19.2564C23.9999 21.2566 22.3784 22.8782 20.3782 22.8782H11.9999L9.10254 12.0006L11.9999 1.12305C13.3415 1.12305 14.5118 1.85303 15.1377 2.93692Z"
                      fill="#3B4145"
                    />
                    <path
                      d="M8.86223 2.93692L0.483891 17.4486C0.176672 17.9808 0 18.5978 0 19.2564C0 21.2566 1.6215 22.8782 3.62175 22.8782H12V1.12305C10.6584 1.12305 9.48811 1.85303 8.86223 2.93692Z"
                      fill="#525A61"
                    />
                    <path
                      d="M22.2615 18.1723L13.8833 3.6607C13.5056 3.00638 12.8122 2.5935 12.0623 2.57227L19.228 21.4289H20.3783C21.5763 21.4289 22.5513 20.454 22.5513 19.2559C22.5513 18.8753 22.4508 18.5006 22.2615 18.1723Z"
                      fill="#FFB751"
                    />
                    <path
                      d="M20.8525 18.1718C21.0162 18.5001 21.1026 18.8748 21.1026 19.2554C21.1026 20.4535 20.2619 21.4284 19.228 21.4284H3.62176C2.42368 21.4284 1.44873 20.4535 1.44873 19.2554C1.44873 18.8748 1.54918 18.5001 1.73846 18.1718L10.1167 3.6602C10.505 2.98802 11.2264 2.57031 12 2.57031C12.0208 2.57031 12.0415 2.57078 12.0623 2.57177C12.706 2.59689 13.3005 3.00878 13.6245 3.6602L20.8525 18.1718Z"
                      fill="#FFD764"
                    />
                    <path
                      d="M12 16.5996V19.0141C12.6669 19.0141 13.2073 18.4737 13.2073 17.8068C13.2073 17.14 12.6669 16.5996 12 16.5996Z"
                      fill="#3B4145"
                    />
                    <path
                      d="M12 16.5996C12.1333 16.5996 12.2414 17.14 12.2414 17.8069C12.2414 18.4738 12.1333 19.0141 12 19.0141C11.3331 19.0141 10.7927 18.4738 10.7927 17.8069C10.7927 17.14 11.3331 16.5996 12 16.5996Z"
                      fill="#525A61"
                    />
                    <path
                      d="M12 6.21875V15.1524C12.6669 15.1524 13.2073 14.6115 13.2073 13.9451V7.42602C13.2073 6.75913 12.6669 6.21875 12 6.21875Z"
                      fill="#3B4145"
                    />
                    <path
                      d="M12 6.21875C12.1333 6.21875 12.2414 6.75913 12.2414 7.42602V13.9451C12.2414 14.6115 12.1333 15.1524 12 15.1524C11.3331 15.1524 10.7927 14.6115 10.7927 13.9451V7.42602C10.7927 6.75913 11.3331 6.21875 12 6.21875Z"
                      fill="#525A61"
                    />
                  </svg>
                </div>
                <h1 className="text-base font-onestBold text-[#2B2C34]">
                  Duplicate Entries Detected in the Uploaded XLS File
                </h1>
              </div>

              <p className="text-sm font-onestMedium text-[#2B2C34]">
                Uh-oh! It looks like there are some duplicate entries in the XLS
                file you uploaded, which might cause some confusion in the data
                analysis.
              </p>

              <div className="flex flex-col">
                <p className="text-sm text-[#767676] font-onestMedium">
                  We noticed these duplications in the following places:
                </p>

                <div className="bg-[#f2f2f2] p-5 h-[130px] overflow-y-auto rounded-lg mt-5">
                  {sheetValidationErrors &&
                    Array.isArray(sheetValidationErrors) &&
                    sheetValidationErrors.map((item: any,index:number) => (
                      <div key={'duplicate_id'+index} className="border-b py-2 border-[#d9d9d9]">
                        <p className="text-sm text-[#767676]">
                          1. {item.type}
                        </p>
                        <li className="list-disc pl-2 text-sm text-[#767676]">
                          {item.message}
                        </li>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex flex-row gap-5 justify-end items-end mt-5">
                <CustomButton
                  handleClick={onCloseClick}
                  text="OK, I will Fix and Upload"
                  classes="bg-darkBlue text-white px-10 py-2"
                />
              </div>
            </div>
          ) : (
            <></>
          )}

          {isProcessed && (
            <div>
              <div className="ag-theme-alpine" style={{ height: 500 }}>
                <AgGridReact
                  suppressDragLeaveHidesColumns={true}
                  gridOptions={{
                    pagination: true,
                    autoSizeStrategy: {
                      type: "fitGridWidth",
                      defaultMinWidth: 200,
                    },
                  }}
                  rowData={rowData}
                  columnDefs={colDefs}
                  pagination={pagination}
                  paginationPageSize={paginationPageSize}
                  paginationPageSizeSelector={paginationPageSizeSelector}
                  onGridReady={onGridReady}
                />
              </div>

              <div className="w-full pt-4 flex justify-end">
                <CustomButton
                  handleClick={onCloseClick}
                  text="Done"
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

FileUploaderModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired
};
