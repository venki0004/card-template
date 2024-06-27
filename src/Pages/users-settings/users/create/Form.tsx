import { useEffect, useState } from "react";
import { ValidateFields } from "../../../../utils/validator";
import { decryptAESKey, decryptData, decryptServerData, encryptAESKey, encryptServerDataUsingKey, generateAESKey } from "../../../../utils/encryption";
import { useNavigate, useParams } from "react-router-dom";
import {
  checkModulePrivilegeAccess,
  showToastMessage,
  validatePhoneNumber,
} from "../../../../utils/helpers";
import HeadingTab from "../../../../components/HeadingTab";
import SelectInput from "../../../../components/SelectInput";
import CustomButton from "../../../../components/CustomButton";
import { axiosInstance } from "../../../../utils/axios";
import Input from "../../../../components/Input";
import CustomCheckbox from "../../../../components/MuiCheckBox";
import { useSelector } from "react-redux";

let fields = {
  name: "",
  email: "",
  phone: "",
  role_id: "",
  is_active: "Active",
  mark_as_exit: false,
  user_secret: "",
};
const Form = () => {
  const { serverPublicKey,clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store,
  )

  const [params, setParams] = useState(fields);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(fields);
  const [roles, setRoles] = useState([]);
  const [isHidden, setIsHidden] = useState(true);

  const navigate = useNavigate();

  const { id } = useParams();

  const handleChange = (e: any) => {
    const { value, name, type, checked } = e.target;
    const temp = { ...params } as any;
    setErrors("" as any);

    if (type === "checkbox") {
      temp[name] = checked;
    } else {
      temp[name] = value;
    }

    setParams(temp);
  };

  const handleCancel = () => {
    navigate("/admin/user-settings/users");
  };

  const handleSubmit = async () => {

    if(params.phone && !validatePhoneNumber(params.phone)) {
      setErrors({ ...errors, phone: 'Please Enter Valid No' });
      return;
    }

    let rules:any = {
      name: "required|max:150",
      email: "required|max:150|email",
      phone: "required|max:13",
      role_id: "required|integer",
      is_active: "required",
    };

    if (!id) {
      rules["user_secret"] = "required|min:8|max:14";
    }

    const namePattern = /^[a-zA-Z0-9\s]+$/;
    if (!namePattern.test(params.name)){
      setErrors({...errors,name:'Invalid Name'})
      return
    }
    const validationError = ValidateFields(params, rules);

    if (typeof validationError === "object") {
      setErrors(validationError);
      return;
    }
    setIsLoading(true);

    const postData = {
      ...params,
      is_active: params?.is_active === "Active" ? 1 : 0,
      mark_as_exit: params?.mark_as_exit === true ? 1 : 0,
    };
    const endpoint = id ? `users/${decryptData(id)}` : `users`;

    let payload:any = {...params}

    let aesKey = await generateAESKey()
    let encryptKey = await encryptAESKey(aesKey,serverPublicKey)
    const encryptionPromises = [
      "name",
      "phone",
      "user_secret",
    ].map(async (property) => {
      if (payload[property]) {
        payload[property] = await encryptServerDataUsingKey(payload[property],aesKey)
      }
    });
    
    await Promise.all(encryptionPromises);
    const request = id
      ? axiosInstance.put(endpoint, payload,{ headers: {'Encrypted-Key': encryptKey}})
      : axiosInstance.post(endpoint, payload,{ headers: {'Encrypted-Key': encryptKey}});

    request
      .then((response: any) => {
        setParams(fields);
        showToastMessage(response.data.message, "success");
        navigate("/admin/user-settings/users");
      })
      .catch((error) => {
        showToastMessage(error?.message, "error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const fetchRoles = () => {
    axiosInstance
      .get(`roles/dropdown`)
      .then((res) => {
        setRoles(res?.data?.data);
      })
      .catch((err) => {
      });
  };

  const fetchUserById = (id: any) => {
    axiosInstance
      .get(`users/${id}`)
      .then(async (res) => {
        let response = res?.data?.data;
        const  key = await decryptAESKey(res?.data.x_key,clientPrivateKey)
        response['name'] = await decryptServerData(response.name,key)
        response['phone'] = await decryptServerData(response.phone,key)
        const modifyData = {
          ...response,
          is_active: response?.is_active === 1 ? "Active" : "Disable",
        };
        setParams(modifyData);
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
      });
  };

  useEffect(() => {
    fetchRoles();
    if (id) {
      let decryptedId = decryptData(id);
      fetchUserById(decryptedId);
    }
  }, [id]);

  return (
    <div className="">
      <div className="w-full bg-white p-6">
        <HeadingTab heading="User Details" />

        <div className="grid grid-cols-2 gap-6 py-8">
          <Input
            rows={1}
            width="w-full"
            disabled={false}
            readOnly={false}
            value={params?.name}
            handleChange={handleChange}
            label="Enter Name"
            name="name"
            helperText={errors?.name}
            error={!!errors?.name}
          />

          <Input
            rows={1}
            width="w-full"
            disabled={false}
            readOnly={false}
            value={params?.email}
            handleChange={handleChange}
            label="Email ID"
            name="email"
            helperText={errors?.email}
            error={errors?.email}
          />

          <div className="relative w-full">
            <Input
              type={isHidden ? "password" : "text"}
              name="user_secret"
              value={params.user_secret}
              handleChange={handleChange}
              label="Password"
              error={errors?.user_secret?.length > 0}
              helperText={
                errors?.user_secret?.includes("required") ? errors?.user_secret : ""
              }
            />

            <button
              onClick={() => {
                setIsHidden((prevState) => !prevState);
              }}
              className="absolute top-3 right-3 flex items-center justify-end"
            >
              <img
                width={24}
                height={24}
                src={
                  isHidden
                    ? "/assets/icons/hidden.svg"
                    : "/assets/icons/shown.svg"
                }
                alt="eye"
                className="cursor-pointer"
              />
            </button>
          </div>

          <Input
            rows={1}
            width="w-full"
            disabled={false}
            readOnly={false}
            value={params?.phone}
            handleChange={handleChange}
            label="Phone Number"
            name="phone"
            helperText={errors?.phone}
            error={errors?.phone}
          />

          <SelectInput
            width="100%"
            options={roles}
            value={params?.role_id}
            handleChange={handleChange}
            label="User Role"
            name="role_id"
            helperText={errors?.role_id}
            error={errors?.role_id}
          />

          <SelectInput
            width="100%"
            options={[
              { id: "Active", name: "Active" },
              { id: "Disable", name: "Disable" },
            ]}
            value={params?.is_active}
            handleChange={handleChange}
            label="User Status"
            name="is_active"
          />

          {id && params?.is_active === "Disable" ? (
            <div className="flex gap-6 p-4 w-full border border-[#E5E7EB] hover:border-[#000000] px-4">
              <CustomCheckbox
                Label="Mark As Exist"
                isChecked={params?.mark_as_exit}
                handleCheck={handleChange}
                name="mark_as_exit"
              />
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

      {checkModulePrivilegeAccess("users", "is_write") ||
      checkModulePrivilegeAccess("users", "is_update") ? (
        <div className="w-full flex justify-end items-center gap-4 pt-6">
          <CustomButton
            loading={isLoading}
            handleClick={handleCancel}
            text="Cancel"
            classes="bg-none border text-black border-black w-fit px-4   py-2"
          />
          <CustomButton
            loading={isLoading}
            handleClick={handleSubmit}
            text="Submit Details"
            classes="bg-darkshadeBlue text-white w-fit px-20   py-2"
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Form;
