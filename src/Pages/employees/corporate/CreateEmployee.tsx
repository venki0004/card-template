import React from "react";
import Form from "./Form";
import Breadcrumb from "../../../components/Breadcrumb";

const index = () => {
  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Employees", url: "/admin/employees/all-employees" },
          { path: "Create New Employee", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        Create New Employee
      </p>
      <br />

      <div className="w-full  rounded-lg">
        <Form />
      </div>
    </div>
  );
};

export default index;
