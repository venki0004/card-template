import { useCallback, useEffect, useRef, useState } from "react";
import Breadcrumb from "../../../components/Breadcrumb";
import { useParams } from "react-router-dom";
import CustomButton from "../../../components/CustomButton";
import SelectInput from "../../../components/SelectInput";
import { axiosInstance } from "../../../utils/axios";
import { decryptAESKey, decryptData, decryptServerData } from "../../../utils/encryption";
import QRCode from "easyqrcodejs";
import { checkModulePrivilegeAccess, showToastMessage } from "../../../utils/helpers";
import { useSelector } from "react-redux";

const ViewCardRequest = () => {
  let { id } = useParams();
  const { clientPrivateKey } = useSelector(
    (state: any) => state.app_central_store,
  )
  id = decryptData(id);
  const codeRef = useRef<HTMLDivElement>(null);
  const [dataById, setDataById] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [isAPILoading, setIsAPILoading] = useState(false);
  const [status, setStatus] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);
  const [copyNotification, setCopyNotification] = useState(false);
  const fetchCardRequestById = useCallback(async () => {
    setIsLoading(true);
    axiosInstance
      .get(`/card-requests/${id}`)
      .then(async (response) => {
        let data = response?.data?.data;
        const  key = await decryptAESKey(response?.data.x_key,clientPrivateKey)
        data['name'] = await decryptServerData(data.name,key)
        data['designation'] = data.designation ? await decryptServerData(data.designation,key) : '--'
        data['department'] = data.department ? await decryptServerData(data.department,key) : '--'
        data['emp_id'] = await decryptServerData(data.emp_id,key)
        if(data.blood_group)   data['blood_group'] = await decryptServerData(data.blood_group,key)

        if (data.card_uuid) {
          data['nfc_id'] = `https://smartbc.axisamc.com/${data.card_uuid}`
      }
      setDataById(data);
      setIsLoading(false);
      })
      .catch((error) => {
        showToastMessage(error.message, "error");
        setIsLoading(false);
      });
  }, [id]);

  useEffect(()=> {
    if(dataById && codeRef){
      if (codeRef.current) {
        const canvas:any = codeRef.current.querySelector('canvas');
          if (canvas) {
            // Clear the canvas
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            // Remove the canvas from the DOM
            canvas.remove();
          }

        new QRCode(codeRef.current, {
          text: `https://smartbc.axisamc.com/${dataById.card_uuid}`,
          autoColor: false, // Automatic color adjustment(for data block)
          autoColorDark: "rgba(0, 0, 0, .6)", // Automatic color: dark CSS color
          autoColorLight: "rgba(255, 255, 255, .7)", // Automatic color: light CSS color
          dotScale: 0.6,
          dotScaleTiming: 0.6,
          correctLevel: QRCode.CorrectLevel.M,
        });
      }
    }
  },[dataById,codeRef])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dataById?.nfc_id);
    setCopyNotification(true);

    setTimeout(() => {
      setCopyNotification(false);
    }, 3000);
  };

  const downloadQr = async () => {
    setIsAPILoading(true);
    await axiosInstance
      .get(`/card-requests/download/${id}`)
      .then((response) => {
        const base64Svg = response?.data?.data;

        const link = document.createElement("a");
        link.href = `data:image/svg+xml;base64,${base64Svg}`;
        link.download = dataById?.name + ".svg";

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        setIsAPILoading(false);
      })
      .catch((error: any) => {
        showToastMessage(error.message, "error");
        setIsAPILoading(false);
      });
  };

  const handleStatus = async () => {
    setDisableBtn(true);
    await axiosInstance
      .put(`/card-requests/${id}`, { status: status })
      .then((response) => {
        showToastMessage(response.data.message, "success");
        fetchCardRequestById();
        setDisableBtn(false);
        setStatus("");
      })
      .catch((error: any) => {
        setDisableBtn(false);
        showToastMessage(error.message, "error");
      });
  };

  useEffect(() => {
    fetchCardRequestById();
  }, [id]);

  let data = [
    {
      title: "Employee ID",
      value: dataById?.emp_id,
    },
    {
      title: "Name",
      value: dataById?.name ?? "-",
    },
    {
      title: "Designation",
      value: dataById?.designation ?? "-",
    },
    {
      title: "Department",
      value: dataById?.department ?? "-",
    },
    {
      title: "Blood Group",
      value: dataById?.blood_group || "--",
    },
    {
      title: "Card Type",
      value: dataById?.card_type ?? "-",
    },
    {
      title: "Access Card Enabled",
      value: `${dataById?.is_access_card_enabled ? 'Yes' : 'No'}` || "--",
    },
    {
      title: "Designation & Dept printed on Business Card",
      value: `${dataById?.is_access_card_enabled ? 'Yes' : 'No'}` || "--",
    },
    {
      title: "image",
      value: dataById?.image_base64 ?? "",
    },
  ];
  return (
    <div>
      <Breadcrumb
        links={[
          { path: "List Of Card Requests", url: "/admin/card-requests" },
          { path: "View Card Request", url: "" },
        ]}
      />
      <p className="text-xl font-extrabold text-shadeDarkBlue font-onestRegular">
        View Card Request
      </p>
      {isLoading ? (
        <div className="flex justify-center items-center w-full h-[80vh]">
          <p className="border px-4 py-2 shadow text-sm">Loading...</p>
        </div>
      ) : (
        <>
          <div className="bg-white mt-6 p-3 lg:p-6 rounded-lg ">
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">Card Details</p>
            </div>

            <div className=" bg-lightshadedGray mt-2 rounded-lg p-4 min-h-[130px] max-h-full flex flex-col lg:grid lg:grid-cols-4 gap-10">
              {data?.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between lg:flex-col lg:justify-start gap-2"
                >
                  <p className=" text-xs text-bluishGray">{item?.title}</p>

                  {item?.title === "image" ? (
                   item?.value ?  <img
                      className="w-20 h-20 rounded"
                      src={item?.value}
                      alt="profile"
                    /> : <>NA</>
                  ) : (
                    <p className="text-sm text-shadeDarkBlue break-words">
                      {item?.value ?? "--"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 pb-8">
            {/* QR */}
            <div className="col-span-4 bg-white mt-6 p-3 lg:p-6 rounded-lg ">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Card QR & NFC</p>
              </div>

              <div className=" bg-lightshadedGray mt-2 rounded-lg p-4 min-h-[130px] max-h-full">
                <div className="item">
                  <div>
                    <h2 className="text-black font-bold text-xl">NFC ID</h2>
                    <p className="truncate">{dataById?.nfc_id}</p>
                    <div className="relative z-20 flex items-center">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center w-auto h-8 px-3 py-1 text-xs bg-white border rounded-md cursor-pointer border-neutral-200/60 hover:bg-neutral-100 active:bg-white focus:bg-white focus:outline-none text-neutral-500 hover:text-neutral-600 group"
                      >
                        <span
                          style={{
                            display: !copyNotification ? "block" : "none",
                          }}
                        >
                          Copy to Clipboard
                        </span>
                        <svg
                          style={{
                            display: !copyNotification ? "block" : "none",
                          }}
                          className="w-4 h-4 ml-1.5 stroke-current"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                          />
                        </svg>
                        <span
                          style={{
                            display: copyNotification ? "inline-block" : "none",
                          }}
                          className="tracking-tight text-green-500"
                        >
                          Copied to Clipboard
                        </span>
                        <svg
                          style={{
                            display: copyNotification ? "inline-block" : "none",
                          }}
                          className="w-4 h-4 ml-1.5 text-green-500 stroke-current"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="item pt-2">
                  <div>
                  <h2 className='text-black font-bold text-xl'> QR</h2>
                    <div className='mb-2' ref={codeRef}></div>
                    <div className="mt-4 flex justify-center">
                      <CustomButton
                        handleClick={downloadQr}
                        disabled={isAPILoading}
                        text={`${isAPILoading ? "Downloading..." : "Download"}`}
                        classes="border border-black px-16  py-2 text-black rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* status */}
            <div className="col-span-8 bg-white mt-6 p-3 lg:p-6 rounded-lg ">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Status Info</p>
              </div>

              <div className=" bg-lightshadedGray mt-2 rounded-lg p-6 max-h-ful">
                <div className="flex justify-start items-center gap-2 w-3/4">
                  <p className="text-sm">Current Status:</p>
                  <p className={`text-green-500 font-bold text-sm`}>
                    {dataById?.card_print_status}
                  </p>
                </div>
                {(dataById?.card_print_status !== "DISPATCHED" &&
                checkModulePrivilegeAccess("card-requests", "is_update")) ? (
                  <>
                  <div className="w-3/4 my-6">
                  <SelectInput
                    width="100%"
                    options={[{ name: "PRINTED" }, { name: "DISPATCHED" }]}
                    handleChange={(e: any) => setStatus(e.target.value)}
                    value={status}
                    label="Status"
                    name="status"
                  />
                </div>
                <div className="mt-6">
                  <CustomButton
                    handleClick={handleStatus}
                    disabled={disableBtn}
                    text={`${disableBtn ? "Updating..." : "Update Status"}`}
                    classes="bg-darkBlue px-16  py-2 text-white rounded-lg"
                  />
                </div> 
                  </>
                ) : <></>
                }
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewCardRequest;
