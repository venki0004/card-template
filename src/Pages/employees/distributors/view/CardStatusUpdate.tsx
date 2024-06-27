import Validator from "validatorjs";
import { Box, Modal } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { useState } from "react";
import { showToastMessage } from "../../../../utils/helpers";
import { axiosInstance } from "../../../../utils/axios";
import CustomButton from "../../../../components/CustomButton";
import TextArea from "../../../../components/TextArea";
import SelectInput from "../../../../components/SelectInput";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "#fcfcfc",
};

const CardStatusUpdateModal = ({
  selectedItem,
  open,
  handleClose,
  refresh,
}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const initialStates = {
    status: "",
    remark: "",
  };
  const [params, setParams] = useState(initialStates) as any;
  const rules = {
    status: "required",
  } as any;

  const [errors, setErrors] = useState(initialStates) as any;

  const onCloseClick = () => {
    setParams(initialStates);
    setErrors({});
    handleClose();
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: value });
    setErrors({});
  };

  const validate = (parameters: any, rule: any) => {
    const validator = new Validator(parameters, rule);

    if (validator.fails()) {
      const fieldErrors: any = {};

      /* eslint-disable */
      for (const key in validator.errors.errors) {
        fieldErrors[key] = validator.errors.errors[key][0];
      }
      /* eslint-enable */

      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    let updatedRules = rules;

    if (params.status === "DISABLED") {
      updatedRules["remark"] = "required|max:1000";
    }
    if (!validate(params, updatedRules)) {
      const err = Object.keys(errors);
      if (err?.length) {
        const input: any = document.querySelector(`input[name=${err[0]}]`);
        if (input) {
          input.scrollIntoView({
            behavior: "smooth",
            block: "end",
            inline: "start",
          });
        }
      }
      showToastMessage("Please check form errors!", "error");
      return;
    }

    setIsLoading(true);

    let payload = {
      status: params.status,
      remark: params.remark,
    };
    axiosInstance
      .put(`/employees/cards/${selectedItem.id}`, payload)
      .then((response) => {
        showToastMessage("STATUS UPDATED SUCCESSFULLY!.", "success");
        onCloseClick();
        refresh();
        setIsLoading(false);
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
        setIsLoading(false);
      });
  };

  return (
    <div className="">
      <Modal
        open={open}
        onClose={onCloseClick}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableEnforceFocus
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Box
          sx={style}
          style={{
            borderRadius: "8px",
            outline: "none",
          }}
        >
          <div className="lg:p-5 md:p-5 p-4 flex flex-col lg:w-[496px] md:w-[496px] w-[300px] m-auto">
            <div className="flex lg:items-center justify-between">
              <div>
                <h1 className="text-lg font-onestMedium text-[#141C4C]">
                  Change the Status
                </h1>
                <p className="text-sm font-onestMedium text-[#141C4C]">
                  Update the change in status with remark
                </p>
              </div>
              <div onClick={handleClose} className="cursor-pointer">
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="Iconly/Light/Close Square">
                    <g id="Close Square">
                      <path
                        id="Stroke 1"
                        d="M14.3936 10.1211L9.60156 14.9131"
                        stroke="#141C4C"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        id="Stroke 2"
                        d="M14.3976 14.9181L9.60156 10.1211"
                        stroke="#141C4C"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        id="Stroke 3"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M16.334 3.27734H7.665C4.644 3.27734 2.75 5.41634 2.75 8.44334V16.6113C2.75 19.6383 4.635 21.7773 7.665 21.7773H16.333C19.364 21.7773 21.25 19.6383 21.25 16.6113V8.44334C21.25 5.41634 19.364 3.27734 16.334 3.27734Z"
                        stroke="#141C4C"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                  </g>
                </svg>
              </div>
            </div>

            <div className="bg-[rgb(241,244,248)] rounded-lg p-5 mt-2">
              <div className="flex flex-col lg:gap-5 md:gap-5 gap-3">
                <SelectInput
                  width="100%"
                  options={[
                    {
                      name: "ACTIVE",
                    },
                    {
                      name: "DISABLED",
                    },
                  ]}
                  handleChange={handleChange}
                  value={params?.status}
                  error={errors?.status}
                  helperText={errors?.status}
                  label="Status"
                  name="status"
                />
                <TextArea
                  placeholder="Add your remark for this status"
                  name="remark"
                  rows={5}
                  readOnly={false}
                  handleChange={handleChange}
                  value={params?.remark}
                  error={errors?.remark}
                  helperText={errors?.remark}
                />
              </div>
            </div>

            <div className=" m-auto mt-5">
              <CustomButton
                loading={isLoading}
                handleClick={handleSubmit}
                text={isLoading ? "Loading..." : "Update Status"}
                classes="bg-darkBlue px-20 py-2 text-white"
              />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default CardStatusUpdateModal;
