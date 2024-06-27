import { useState } from "react";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Validator from "validatorjs";
import { axiosInstance } from "../utils/axios";
import { getUserBaseModulePath, showToastMessage } from "../utils/helpers";
import { useSelector } from "react-redux";
import { encryptAESKey, encryptData, encryptServerDataUsingKey, generateAESKey } from "../utils/encryption";

const fields = {
  email: "",
  user_secret: "",
};

const Login = () => {
  const [params, setParams] = useState(fields);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState(fields);
  const [isHidden, setIsHidden] = useState(true);
  const { serverPublicKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  const navigate = useNavigate();
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    const validation = new Validator(
      params,
      {
        email: "email|required",
        user_secret: "required|min:8|max:14",
      },
      {
        required: "*required",
      }
    );

    if (validation.fails()) {
      const fieldErrors: any = {};
      Object.keys(validation.errors.errors).forEach((key) => {
        fieldErrors[key] = validation.errors.errors[key][0];
      });
      setFormErrors(fieldErrors);
      return false;
    }
    setIsLoading(true);
    let payload = {...params}
    let aesKey = await generateAESKey()
    let encryptPassword = await encryptServerDataUsingKey(payload.user_secret,aesKey)
    let encryptEmail = await encryptServerDataUsingKey(payload.email,aesKey)
    let encryptKey = await encryptAESKey(aesKey,serverPublicKey)
    const reqPayload = {
      email: encryptEmail,
      user_secret:encryptPassword
    }
    axiosInstance
      .post("/login", reqPayload, { headers: {'Encrypted-Key': encryptKey}})
      .then((response) => {
        setIsLoading(false);
        let user = response.data
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email,
          user_permissions: user.user_permissions
        }
        localStorage.setItem("auth-user", encryptData(JSON.stringify(userInfo)));
        localStorage.setItem("user-token", encryptData(user.token));
        navigate(getUserBaseModulePath(userInfo))
      })
      .catch((error) => {
        setIsLoading(false);
        showToastMessage(error.message, "error");
      });

  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;
    setParams({
      ...params,
      [name]: value,
    });
    setFormErrors(fields);
  };

  return (
    <div className="grid w-full h-screen grid-cols-2 items-center">
      <div className="w-full h-full flex items-center bg-appTheme ">
        <div className=" w-full space-y-6 ">
          <img alt='scube-logo' src="/assets/images/scube_brand_logo.webp" className="m-auto" />
          <p className=" body1 text-white text-center">
            Transforming vision into digital realities!
          </p>
        </div>
      </div>
      <div className=" flex  items-center justify-center w-2/3 m-auto">
        <div className="space-y-6">
          <h3 className="text-center font-bold">
            Welcome to Scube Enterprise Smart Business Card
          </h3>
          <p className="title3 text-slateGray text-center">
            Please sign-in to your account to manage the cards of Employees!
          </p>
          <form  onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 w-full lg:my-12 my-6">
            <Input
              type="text"
              name="email"
              value={params.email}
              handleChange={handleChange}
              label="Email"
              error={formErrors?.email?.length > 0}
              helperText={formErrors?.email}
            />

            <div className="relative w-full">
              <Input
                type={isHidden ? "password" : "text"}
                name="user_secret"
                value={params.user_secret}
                handleChange={handleChange}
                label="Password"
                error={formErrors?.user_secret}
                helperText={
                  formErrors?.user_secret?.includes("required")
                    ? formErrors?.user_secret
                    : ""
                }
              />

              <button
                onClick={() => {
                  setIsHidden((prevState) => !prevState);
                }}
                className="absolute top-3 right-3 flex items-center justify-end"
                type="button"
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
          </div>

          <div className="flex justify-center">
            <CustomButton
              loading={isLoading}
              text="Login"
              classes="bg-darkshadeBlue w-full text-white  px-20  py-3"
              type="submit"
            />
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
