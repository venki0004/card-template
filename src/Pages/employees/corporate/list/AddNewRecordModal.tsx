import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import PropTypes from "prop-types";
import { DialogTitle } from "@mui/material";
import CustomButton from "../../../../components/CustomButton";
import { showToastMessage } from "../../../../utils/helpers";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    backgroundColor: "#FFFFFF",

    width: "100%",
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function RecordModal({
  open,
  handleClose,
  handleUploadFile,
}: any) {
  const downloadTemplate = () => {
    const linkSource = `/assets/templates/template.xlsx`;
    const downloadLink = document.createElement("a");
    const fileName = `template.xlsx`;
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
    showToastMessage("Template file successfully downloaded!", "success");
  };
  


  return (
    <div className="w-full">
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        PaperProps={{
          sx: {
            minWidth: {
              xs: "90%",
              sm: "60%",
              md: "800px",
              lg: "500px",
              xl: "500px",
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
              Upload to the Admin Panel
            </p>

            <button onClick={handleClose}>
              <img
                src="/assets/icons/closeIcon.svg"
                className="cursor-pointer"
                alt="close_icon"
              />
            </button>
          </div>
          <p className="text-sm leading-snug w-11/12 py-1">
            To ensure that your data updates ar processed accurately and
            efficiently, we recommend following these simple steps:
          </p>
        </DialogTitle>
        <DialogContent>
          <div className="w-full gradientBg ">
            <div className="w-full border my-4 p-4">
              <p className="text-shadeDarkBlue font-bold text-sm">
                Step 1: Download the Data Sheet
              </p>
              <p className=" text-sm font-normal py-2">
                Click the “Download Data Sheet” button to obtain latest version
                of the data sheet. This file contains the most up-t-date
                template with all the necessary fields for your data updates.
              </p>

              <div className="w-full flex justify-end">
                <CustomButton
                  handleClick={downloadTemplate}
                  text="Download data sheet"
                  classes="bg-none border border-black  text-black w-fit px-4  py-2"
                />
              </div>
            </div>

            <div className="w-full border my-4 p-4">
              <p className="text-shadeDarkBlue font-bold text-sm">
                Step 2: Update Data in the File
              </p>
              <p className=" text-sm font-normal py-2">
                Open the downloaded data sheet using your preferred spreadsheet
                software (e.g., Microsoft Excel, Google Sheets). Here, you can
                add, modify, or remove the data as needed. Please ensure that
                all the changes are made in accordance with the{" "}
                <span className="text-red-500">provided guidelines.</span>
              </p>
            </div>

            <div className="w-full border my-4 p-4">
              <p className="text-shadeDarkBlue font-bold text-sm">
                Step 3: Save the Updated Data Sheet
              </p>
              <p className=" text-sm font-normal py-2">
                After making the necessary changes, save the data sheet to your
                computer, ensuring it’s saved in the XLS format.
              </p>
            </div>

            <div className="w-full border my-4 p-4">
              <p className="text-shadeDarkBlue font-bold text-sm">
                Step 4: Upload to the Admin Panel
              </p>
              <p className=" text-sm font-normal py-2">
                Now click the “Upload  File” button below, and select
                the updated data sheet from your computer. This will initiate
                the process of updating the data on the admin panel.
              </p>

              <div className="w-full flex justify-end">
                <CustomButton
                  handleClick={handleUploadFile}
                  text="Upload File"
                  classes="bg-darkshadeBlue text-white w-fit px-4  py-2"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
}

RecordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleUploadFile: PropTypes.func.isRequired,
};
