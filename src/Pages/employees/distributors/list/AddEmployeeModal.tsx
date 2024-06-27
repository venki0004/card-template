import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function AddEmployeeModal({
  open,
  handleClose,
  handleAddRecord,
}:any) {
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
        <DialogContent>
          <div className="relative">
            <h4 className="text-left   text-chaosblack" id="modal-headline">
              Bulk Upload
            </h4>

            <button onClick={handleClose}>
              <img
                src="/assets/icons/closeIcon.svg"
                className="absolute right-0 top-0 cursor-pointer"
                alt="close_icon"
              />
            </button>
          </div>

          <div className="w-full gradientBg md:p-4">
            <div className="grid grid-cols-2 gap-6">
              <Link to="/admin/employees/distributors/create">
                <div className=" p-4  bg-[#F8F9FB] hover:border border-darkshadeBlue cursor-pointer">
                  <img
                    src="/assets/images/bulkUser.svg"
                    alt="user"
                    className="m-auto"
                  />
                  <p className=" text-center font-medium py-3 text-shadeDarkBlue text-sm">
                    Add Individual <br /> Employee
                  </p>
                </div>
              </Link>

              <button onClick={handleAddRecord}>
                <div className=" p-4 cursor-pointer  bg-[#F8F9FB] hover:border border-darkshadeBlue">
                  <img src="/assets/images/folder.svg" alt="user" className="m-auto" />
                  <p className=" text-center font-medium py-3 text-shadeDarkBlue text-sm">
                    Add Bulk <br /> Records
                  </p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
}

AddEmployeeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleAddRecord: PropTypes.func.isRequired,
};
