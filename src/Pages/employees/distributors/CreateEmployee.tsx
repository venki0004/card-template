import React from "react";
import Form from "./Form";
import Breadcrumb from "../../../components/Breadcrumb";
import { useParams } from "react-router-dom";

const index = () => {
  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Distributors", url: "/admin/employees/distributors" },
          { path: "Create New Distributor", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        Create New Distributor
      </p>
      <br />

      <div className="w-full  rounded-lg">
        <Form />
      </div>
    </div>
  );
};

export default index;
