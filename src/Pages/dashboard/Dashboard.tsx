import React, { useEffect, useState } from "react";
import { AreaChart } from "@tremor/react";
import { axiosInstance } from "../../utils/axios";
import { showToastMessage } from "../../utils/helpers";
import SelectInput from "../../components/SelectInput";
import { useSelector } from "react-redux";
const statsData = [
  {
    title: "Total Number of Employees",
    value: "--",
  },
  {
    title: "Total Number of Active Cards",
    value: "--",
  },
  {
    title: "Total Number of Inactive Cards",
    value: "--",
  },
];


const Dashboard = () => {
 
  const { serverPublicKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  
  const [metaData, setMetaData] = useState(statsData);
  const [series, setSeries] = useState([]);
  let fields = {
    dateRange: 7,
  };

  const [params, setParams] = useState(fields);
  const handleFilterChange = (e: any) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: value });
    fetchGraphData({ ...params, [name]: value })
  };
  const fetchData = () => {
    axiosInstance
      .get(`statistics`)
      .then((res) => {
        const data = res.data.data;
        let ele = [...statsData]
        ele[0].value = data.total_employees;
        ele[1].value = data.total_active_cards;
        ele[2].value = data.total_inactive_cards;
        setMetaData(ele);
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
      });
  };

  const fetchGraphData = (params: any) => {
    axiosInstance
      .get(`statistics/stats?dateRange=${params.dateRange}`)
      .then((res) => {
        const data = res.data.statistics;
        setSeries(data)
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
      });
  };

  useEffect(() => {
    fetchData();
    fetchGraphData(params);
  }, []);

  return (
    <div className="w-full">
      <div className="flex  justify-between flex-col sm:flex-row">
        <div>
          <p className="subheading font-onestRegular">Dashboard</p>
          <hr className="w-32 md:w-full line" />
        </div>
      </div>

      <div className="my-4 w-full grid grid-cols-3 gap-6">
        {React.Children.toArray(
          metaData.map((item) => (
            <div className="border bg-white p-5">
              <p className="py-2 text-base text-shadeDarkBlue/60">
                {item?.title}
              </p>
              <p className=" font-bold text-3xl text-shadeBlue">
                {item?.value}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white">
        <div className="flex justify-between items-center p-4 border-b">
          <p className="font-onestSemiBold font-bold text-base">Card Analytics</p>
          <div className="w-[250px]">
            <SelectInput
              options={[
                { name: "Past 24 hours", id: 1 },
                { name: "Past 7 days", id: 7 },
                { name: "Past 30 days", id: 30 },
                { name: "Past 1 year", id: 365 },
              ]}
              handleChange={handleFilterChange}
              value={params?.dateRange}
              label="Select Date"
              name="dateRange"
            />
          </div>
        </div>
        <div className="p-4 mt-4">
          <div>
            <AreaChart
              className="h-[60vh]"
              data={series}
              index="date"
              categories={["TOTAL_SHARED"]}
              yAxisWidth={60}
              showLegend={false}
              curveType="monotone"
              colors={["blue"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
