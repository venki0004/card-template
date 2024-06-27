import React from "react";

import Breadcrumb from "../../../components/Breadcrumb";
import Form from "./Form";
import { useParams } from "react-router-dom";
import { decryptData, encryptData } from "../../../utils/encryption";

const EditEmployee = () => {
  const { id } = useParams();

  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Employees", url: "/admin/employees/all-employees" },
          { path: "Edit Employee", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        Edit Employee
      </p>
      <br />

      <div className="w-full  rounded-lg">
        <Form id={decryptData(id)} />
      </div>
    </div>
  );
};

export default EditEmployee;
