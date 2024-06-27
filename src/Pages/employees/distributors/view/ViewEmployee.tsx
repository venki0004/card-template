import React, { useEffect, useState } from "react";
import EmployeeInfo from "./EmployeeInfo";
import ManageCards from "./ManageCards";
import Breadcrumb from "../../../../components/Breadcrumb";
import BasicTabs from "../../../../components/Tab";
import { decryptAESKey, decryptData, decryptServerData } from "../../../../utils/encryption";
import { axiosInstance } from "../../../../utils/axios";
import { useParams } from "react-router-dom";
import { showToastMessage } from "../../../../utils/helpers";
import { useSelector } from "react-redux";

const TabConstants = [
  {
    title: " Employee Information ",
  },
  {
    title: " Manage Cards",
  },
];

const ViewEmployee = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState({});
  const { clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  const decryptedId = decryptData(id);
  const getEmployeeById = () => {
    axiosInstance
      .get(`/employees/${decryptedId}`)
      .then(async (res) => {
        let response = res?.data?.data;
        const  key = await decryptAESKey(res?.data.x_key,clientPrivateKey)
        response['name'] = await decryptServerData(response.name,key)
        response['designation'] =  response.designation ? await decryptServerData(response.designation,key) : '--'
        response['department'] = response.department ? await decryptServerData(response.department,key) : '--'
        response['primary_phone'] = response.primary_phone ? await decryptServerData(response.primary_phone,key) : '--'
        response['email'] = response.email ? await decryptServerData(response.email,key) : '--'
        response['emp_id'] = await decryptServerData(response.emp_id,key)
        if(response.whatsapp_number)   response['whatsapp_number'] = await decryptServerData(response.whatsapp_number,key)
        if(response.blood_group)   response['blood_group'] = await decryptServerData(response.blood_group,key)

        setEmployee(response);
      })
      .catch((error) => {
        showToastMessage(error.message, 'error')
      });
  };

  useEffect(() => {
    getEmployeeById();
  }, []);

  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Distributors", url: "/admin/employees/distributors" },
          { path: "View Distributor", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        View Distributor
      </p>
      <br />

      <div className="">
        <BasicTabs
          cols={TabConstants}
          data={[
            <EmployeeInfo refresh={getEmployeeById} employee={employee} key={1} />,
            <ManageCards id={decryptedId} key={2} />,
          ]}
        />
      </div>   
    </div>
  );
};

export default ViewEmployee;
