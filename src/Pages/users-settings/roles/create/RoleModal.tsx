import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import ModulesAccess from "./ModuleAccess";
import CustomButton from "../../../../components/CustomButton";
import RadioButton from "../../../../components/RadioButton";
import Input from "../../../../components/Input";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
    width: "100%",
    alignItems: "center",
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .css-1t1j96h-MuiPaper-root-MuiDialog-paper": {
    backgroundColor: "#404050",
  },
  dialogCustomizedWidth: {
    "max-width": "80%",
  },
}));

const items = [
  {
    value: "Manager",
    label: "Manager",
  },
  {
    value: "Executive",
    label: "Executive",
  },
];

const BootstrapDialogTitle = (props: any) => {
  const { children, onClose, type, ...other } = props;

  const closeModel = () => {
    onClose();
  };
  return (
    <DialogTitle sx={{ m: 0, p: 3 }} {...other}>
      {children}
      <IconButton
        aria-label="close"
        onClick={closeModel}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[600],
        }}
      >
        <img src="/assets/icons/closeIcon.svg" alt="" />
      </IconButton>
    </DialogTitle>
  );
};


const RoleModal = ({
  open,
  handleClose,
  title,
  type,
  name,
  submit,
  params,
  handleRootChange,
  handleChildChange,
  handleChange,
  formErrors,
  isApiLoading
}: any) => {
  const items = [
    {
      value: "Manager",
      label: "Manager",
    },
    {
      value: "Executive",
      label: "Executive",
    },
  ];

  return (
    <div>
      <BootstrapDialog
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(5px)",
          },
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
        PaperProps={{
          sx: {
            width: "80%",
            m: 0,
            backgroundColor: "arsenic",
            alignItems: "center",
            borderColor: "arsenic",
            borderRadius: "0px"
          },
        }}
      >
        <BootstrapDialogTitle onClose={handleClose} type={type}>
          <div className="flex justify-start">
            <p className="font-bold font-onestRegular flex justify-start absolute top-3 left-6">
              {title}
            </p>
          </div>
        </BootstrapDialogTitle>
        <DialogContent>
          <div className="flex flex-col mt-2 gap-10">
            <div className="w-full bg-lightshadedGray p-6 flex flex-col gap-6">
              <Input
                rows={1}
                width="w-full"
                disabled={false}
                readOnly={false}
                error={!!formErrors.name}
                value={params?.name}
                handleChange={handleChange}
                helperText={formErrors.name}
                label="Enter the User Role*"
                name="name"
              />

              <div className="default_container">
                <div>
                  <p className="text-s font-onestRegular mb-2">
                    <u>Select the level that user can Access:</u>
                  </p>
                  <RadioButton
                    onChange={handleChange}
                    items={items}
                    defaultValue={params.role}
                    name="is_manager"
                  />
                </div>
              </div>

              <div className="default_container">
                <div className="mb-2">
                  <p className="text-s font-onestRegular mb-2">
                    <u>Select the Module that user can Access:</u>
                  </p>
                </div>

                <ModulesAccess
                  params={params}
                  handleRootChange={handleRootChange}
                  handleChildChange={handleChildChange}
                />
              </div>
            </div>
          </div>
        </DialogContent>

        <div className="flex justify-center pt-2 pb-6">
          <CustomButton
            loading={isApiLoading}
            text={params.id ? " Update Role " : "Submit Role"}
            classes="bg-darkBlue text-white text-black w-fit px-4  py-2"
            handleClick={submit}
          />
        </div>
      </BootstrapDialog>
    </div>
  );
};

export default RoleModal;