import moment from "moment";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { decryptAESKey, decryptData, decryptServerData } from "../../../../utils/encryption";
import Breadcrumb from "../../../../components/Breadcrumb";
import Logs from "../../../../components/Logs";
import { axiosInstance } from "../../../../utils/axios";
import { showToastMessage } from "../../../../utils/helpers";
import Pagination from "../../../../components/Pagination/Pagination";
import { useSelector } from "react-redux";
const fields = {
  start_date: "",
  end_date: "",
};

const ViewUser = () => {
  const { clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  const { id } = useParams();

  const [currentPage, setCurrentPage] = useState(1)
  const [params, setParams] = useState(fields);
  const [userData, setUserData] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({
    total:0
  });
  const [userLogs, setUserLogs] = useState([]);
  const basicInfo = [
    {
      name: "User ID",
      value: userData?.id ?? "--",
    },
    {
      name: "Name",
      value: userData?.name ?? "--",
    },
    {
      name: "Email ID ",
      value: userData?.email ?? "--",
    },
    {
      name: "Phone Number  ",
      value: userData?.phone ?? "--",
    },
    {
      name: "Role",
      value: userData?.email ?? "--",
    },
    {
      name: "Created On ",
      value: moment(userData?.created_at).format("h:mm A; DD/M/yy") ?? "--",
    },

    {
      name: "Status",
      value: userData?.is_active ? 'ACTIVE': 'DISABLED',
    },
  ];

  const onDateRangeSelection = (dates: any) => {
    const {start_date, end_date} = dates;
    const sDate = moment(start_date).format("YYYY-MM-DD");
    const eDate = moment(end_date).format("YYYY-MM-DD");
    setParams({ ...params, start_date: sDate, end_date: eDate });
    let decryptedId = decryptData(id);

    if(start_date && end_date) {
      fetchUserLogs(decryptedId,{ ...params, start_date: sDate, end_date: eDate })
    } else {
      fetchUserLogs(decryptedId,{ ...params, start_date: '', end_date: '' })
    }
  };
  const fetchUserLogs = (id: any, params:any) => {
    axiosInstance
      .get(
        `users/logs/${id}?from=${params.start_date}&to=${params.end_date}&page=${currentPage}`
      )
      .then((res) => {
        let response = res?.data?.data;
        setPaginationMeta(response.pagination)
        setUserLogs(response.data);
      })
      .catch((err) => {
      })
  };

  const fetchUserById = (id: any) => {
    setIsLoading(true);
    axiosInstance
      .get(`users/${id}`)
      .then(async (res: any) => {
        let response = res?.data?.data;
        const  key = await decryptAESKey(res?.data.x_key,clientPrivateKey)
        response['name'] = await decryptServerData(response.name,key)
        response['phone'] = await decryptServerData(response.phone,key)
        const modifyData = {
          ...response,
          status: response?.status === 1 ? "Active" : "Disable",
          password: "",
        };

        setUserData(modifyData);
      })
      .catch((error: any) => {
        showToastMessage(error.message, 'error')
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (id) {
      let decryptedId = decryptData(id);
      fetchUserById(decryptedId);
    }
  }, [id]);

  useEffect(() => {
    let decryptedId = decryptData(id);
    fetchUserLogs(decryptedId,params);
}, [currentPage])

  return (
    <div className="">
      <Breadcrumb
        links={[
          { path: "List Of Users", url: "/admin/user-settings/users" },
          { path: "View User", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        View User
      </p>
      <br />

      {isLoading ? (
        "Loading..."
      ) : (
        <div className="w-full grid grid-cols-[350px_minmax(700px,_1fr)_0px]   ">
          <div className=" bg-white rounded-lg p-3 ">
            <div className="mt-1">
              <p className=" font-semibold text-base pb-2">
                User Basic Information
              </p>
              <div className="bg-lightshadedGray rounded-lg p-4">
                <div className="bg-CalmWaters  flex flex-col gap-y-6 rounded-lg p-4 font-onestRegular ">
                  {React.Children.toArray(
                    basicInfo?.map((item) => (
                      <div className="flex justify-between">
                        <p className=" text-xs text-bluishGray">{item?.name}</p>
                        <p className="text-sm text-shadeDarkBlue  text-right w-40 break-words ">
                          {item?.value}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className=" ml-10 rounded-lg">
            <div className="w-full bg-white rounded-lg pt-4 pl-4  flex  items-center">
              <div className="w-[100px] flex justify-center items-center font-semibold text-lg  border-b-2 pb-2 border-black text-black">
                Logs
              </div>
            </div>

            <div className="w-full bg-white mt-6 rounded-lg p-4">
              <div className="default_container bg-white">
                <Logs
                  isdateFilter={true}
                  logs={userLogs}
                  image={userData?.image ?? ""}
                  onDateSelect={onDateRangeSelection}
                />
                 <div className='w-full p-4 flex justify-center gap-10'>
                            <Pagination
                                className='pagination-bar'
                                currentPage={currentPage}
                                totalCount={paginationMeta?.total}
                                pageSize={10}
                                onPageChange={(page: any) => {
                                    setCurrentPage(page)
                                }}
                            />
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUser;
