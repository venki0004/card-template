import moment from "moment";
import { DateFilter } from "./DateFilter";

const statusList = [
  {
    list: ["un_assigned", "unassigned", "processing"],
    class: "bg-metallicSilver",
  },
  {
    list: ["call_back", "call back", "inactive", "confirmed", "dispatching"],
    class: "bg-yellowOrange",
  },
  {
    list: ["linked", "interested"],
    class: "bg-vividYellow",
  },
  {
    list: ["dispatched", "assigned", "order placed", "order_placed"],
    class: "bg-azure",
  },
  {
    list: ["delivered", "converted", "Active"],
    class: "bg-limeGreen",
  },
];

const getBgClass = (status: any) => {
  let className = "bg-carminePink";
  for (const item of statusList) {
    if (item.list.some((x) => status.toLowerCase().includes(x.toLowerCase()))) {
      className = item.class;
      break;
    }
  }
  return className;
};

const Logs = ({
  isdateFilter,
  logs,
  onDateSelect,
}: any) => {
  return (
    <>
      {isdateFilter ? (
        <>
          <div className="flex justify-between items-center pb-2 ">
            <p className="subheading"></p>

            <div className="filters hidden sm:block">
              <DateFilter onDateRangeSelect={onDateSelect} />
            </div>
          </div>

          <div className="filters w-full sm:hidden pb-2 ">
            <br />
            <DateFilter onDateRangeSelect={onDateSelect} />
          </div>
        </>
      ) : (
        ""
      )}

      <div className="mobileView rounded-xl border border-[#e5e7eb] ">
        <div className="rounded-md  py-6 px-4 ">
          {logs &&
            logs.length > 0 &&
            logs?.map((e: any) => (
              <div key={e?.id} className=" relative mb-3">
                {e.type !== "STATUS" ? (
                  <div className=" flex w-full  gap-2 items-center ">
                    {e?.user?.image ? (
                      <img
                        className=" w-8 h-8  rounded-full"
                        src={e.user.image}
                        alt="blank"
                      />
                    ) : (
                      <div
                        className="  m-1 mr-1 w-10 h-9 relative flex justify-center
                                                    items-center rounded-full bg-lightGray text-sm text-Comet uppercase
                                                    cursor-pointer"
                      >
                        {e?.user_name.charAt(0)}
                      </div>
                    )}

                    <div className="w-full flex justify-between">
                      {" "}
                      <p className="text-sm md:text-base text-Comet break-word-all">
                        {e.user_name}{" "}
                        {e.type === "NOTE" ? (
                          <span className=" text-sm text-Comet">
                            added notes :
                          </span>
                        ) : (
                          ""
                        )}{" "}
                        <span className=" text-sm text-Comet ">
                          {e.message}
                        </span>
                      </p>
                      <p className=" text-Comet text-sm ml-10">
                        {moment(e.created_at).format("h:mm A; DD/M/yy")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex sm:flex-row flex-col w-full justify-between mt-3 ">
                    <div
                      className={` bg-opacity-10 w-fit flex gap-3 items-center px-4 py-2 rounded-lg border-2 border-opacity-20 ${getBgClass(
                        e.message
                      )} ${getBgClass(e.message).replace("bg", "border")}`}
                    >
                      <div
                        className={` w-2.5 h-2.5  rounded-md border border-black  ${getBgClass(
                          e.message
                        )} ${getBgClass(e.message).replace("bg", "border")}`}
                      />
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                          __html: e.message.replace(
                            "<span>",
                            `<span class=${getBgClass(e.message).replace(
                              "bg",
                              "text"
                            )}> `
                          ),
                        }}
                      />
                    </div>

                    <p className=" text-Comet text-sm">
                      {moment(e.created_at).format("h:mm A; DD/M/yy")}
                    </p>
                  </div>
                )}
              </div>
            ))}

          {(logs && !logs?.length) || !logs ? (
            <div className="flex justify-center items-center flex-col gap-4 mt-6">
              <p className="text-[18px] font-onestBold">No Logs found !!</p>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </>
  );
};

export default Logs;
