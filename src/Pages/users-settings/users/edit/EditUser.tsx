import React from "react";
import Form from "../create/Form";
import Breadcrumb from "../../../../components/Breadcrumb";

const EditUser = () => {
  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Users", url: "/admin/user-settings/users" },
          { path: "Edit User", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        Edit User
      </p>
      <br />

      <div className="w-full  rounded-lg">
        <Form />
      </div>
    </div>
  );
};

export default EditUser;
