import { useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import { axiosInstance } from "../../../../utils/axios";
import { checkModulePrivilegeAccess, showToastMessage } from "../../../../utils/helpers";

const EmployeeInfo = ({ employee, refresh }: any) => {
  const [loading, setLoading] = useState(false);
  let data = [
    {
      title: "Employee ID",
      value: `${employee?.emp_id}` || "--",
    },
    {
      title: "Name",
      value: `${employee?.name}` || "--",
    },
    {
      title: "Email ID",
      value: `${employee?.email}` || "--",
    },
    {
      title: "Primary Number",
      value: `${employee?.primary_phone}` || "--",
    },
    {
      title: "Whatsapp Number",
      value: `${employee?.whatsapp_number}` || "--",
    },
    {
      title: "Department",
      value: `${employee?.department}` || "--",
    },
    {
      title: "Designation",
      value: `${employee?.designation}` || "--",
    },
    {
      title: "Card Status",
      value: `${employee?.card_status}` || "--",
    },
    {
      title: "Blood Group",
      value: `${employee?.blood_group}` || "--",
    },
    {
      title: "Card Type",
      value: `${employee?.card_type}` || "--",
    },
    {
      title: "Access Card Enabled",
      value: `${employee?.is_access_card_enabled ? 'Yes' : 'No'}` || "--",
    },
    {
      title: "Designation & Dept printed on Business Card",
      value: `${employee?.is_print_dept_designation ? 'Yes' : 'No'}` || "--",
    },
    {
      title: "Work Address",
      value: `${employee?.work_location}` || "--",
    },
  ];

  const RequestCard = (employeeId: any) => {
    setLoading(true);
    axiosInstance
      .put(`/employees/card-print-request/${employeeId}`)
      .then((response: any) => {
        showToastMessage('CARD REQUESTED SUCCESSFULLY!.', "success");
        refresh()
      })
      .catch((error) => {
        showToastMessage(error.message, 'error')
      })
      .finally(() => {
        setLoading(false);
      });
  };
  return (
    <div className="bg-white p-3 lg:p-6">
      <div className="flex justify-between items-center">
        <p className="text-lg font-bold">Employee Information</p>
        {!employee?.is_print_requested &&  checkModulePrivilegeAccess("distributors", "is_update") ? (
          <CustomButton
            loading={loading}
            handleClick={() => {
              RequestCard(employee.id);
            }}
            text="Request Card"
            classes="bg-darkBlue px-20 py-2 text-white"
          />
        ) : (
          ""
        )}
      </div>

      <div className=" bg-lightshadedGray mt-4 p-4 min-h-[130px] max-h-full flex flex-col lg:grid lg:grid-cols-4 gap-10">
        {data?.map((item, index) => (
          <div
            key={item?.title}
            className="flex justify-between lg:flex-col lg:justify-start gap-2"
          >
            <p className="text-xs text-bluishGray">{item?.title}</p>
            <p className="text-sm text-shadeDarkBlue break-words">
              {item?.value ?? "--"}
            </p>
          </div>
        ))}
         <>
        <div
            className="flex justify-between lg:flex-col lg:justify-start gap-2"
          >
            <p className="text-xs text-bluishGray">Image</p>
            <p className="text-sm text-shadeDarkBlue break-words">
              {
                employee.image_base64 ? 
                <img
                className="w-20 h-20 rounded"
                src={employee.image_base64}
                alt="profile"
              />  : <>NA</>
              }
            </p>
            </div>
        </>
      </div>
    </div>
  );
};

export default EmployeeInfo;
