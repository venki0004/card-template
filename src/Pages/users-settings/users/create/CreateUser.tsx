import Form from "./Form";
import Breadcrumb from "../../../../components/Breadcrumb";

const CreateUser = () => {
  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Users", url: "/admin/user-settings/users" },
          { path: "Create New User", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        Create New User
      </p>
      <br />

      <div className="w-full  rounded-lg">
        <Form />
      </div>
    </div>
  );
};

export default CreateUser;
