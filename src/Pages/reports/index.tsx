import { useState } from "react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import moment from "moment";
import { axiosInstance } from "../../utils/axios";
import CustomButton from "../../components/CustomButton";
import { DateRangePicker } from "../../components/DateRangePicker";
import SelectRadio from "../../components/SelectRadio";
import { ValidateFields } from "../../utils/validator";
import { showToastMessage } from "../../utils/helpers";

const ReportListing = () => {
  let fields = {
    from: "",
    to: "",
    report_type: "new_print",
  };

  const [params, setParams] = useState(fields);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDateRangeFilter = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    const sDate = moment(start).format("YYYY-MM-DD");
    const eDate = moment(end).format("YYYY-MM-DD");
    setParams({ ...params, from: sDate, to: eDate });
  };

  const downloadReport = () => {
    const validationError = ValidateFields(params, {
      from: "required",
      to: "required",
      report_type: "required",
    });

    if (typeof validationError === "object") {
      showToastMessage('Please select date','error')
      return;
    }

    setIsLoading(true);
    axiosInstance
      .get(`/reports?from=${params.from}&to=${params.to}&report_type=${params.report_type}`)
      .then((response) => {
        showToastMessage("REPORT GENERATED SUCCESSFULLY", "success");
        setIsLoading(false);
        if(response.data.status){
          const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response.data.base64String}`;
          const downloadLink = document.createElement("a");
          const fileName = `reports.xlsx`;
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        showToastMessage(err.message, 'error')
      });

  };

  return (
    <div className="">
      <div className="flex justify-between flex-col sm:flex-row">
        <div>
          <p className="subheading">Reports</p>
          <hr className="w-32 md:w-full line" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center lg:mt-20">
        <div className="lg:w-10/12 mx-auto h-fit mt-6 bg-[#f2f2f2] p-4">
          <div className="w-full bg-white h-full p-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <DateRangePicker
                label={"Date Created"}
                onChange={handleDateRangeFilter}
                startDate={startDate}
                endDate={endDate}
                width="w-full"
                istodaymax={true}
              />

              <SelectRadio
                value={params.report_type}
                label="Report Type"
                name="type"
                options={[
                  {
                    name: "New Cards",
                    value: "new_print",
                  },
                  {
                    name: "Replaced Cards",
                    value: "re_print",
                  },
                ]}
                onClick={(value: any) => {
                  setParams({
                    ...params,
                    report_type: value,
                  });
                }}
              />
            </div>
            <CustomButton
              handleClick={downloadReport}
              disabled={isLoading}
              loadeing={isLoading}
              text="Download"
              classes="bg-darkshadeBlue text-white w-fit px-4 py-2 ml-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportListing;
