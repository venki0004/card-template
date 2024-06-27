import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useMemo } from "react";
import { ClickAwayListener } from "@mui/material";

export const DateRangePicker = ({
  startDate,
  onChange,
  endDate,
  label,
  istodaymax,
  istodayMin,
  view,
  error,
  width,
}: any) => {
  const today = new Date();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  };

  useMemo(() => {
    if (endDate != null || endDate != undefined) setOpen(false);
  }, [endDate]);
  return (
    // <ClickAwayListener onClickAway={() => setOpen(false)}>
    <div
      className={`bg-white h-[46px] w-full ${
        width ? width : "lg:w-[280px]"
      } font-normal px-2 flex justify-between items-center gap-2 sm:gap-5 date-range-picker  border hover:border cursor-pointer hover:border-[#000000]  border-[#E7E8ED] ${
        error ? "input-error" : ""
      }`}
    >
      <div className="w-full">
        <label
          htmlFor={label}
          className={`mb-0 custom-label block text-text text-md ${
            startDate ? "toggle-label" : ""
          }`}
        >
          {label ?? "Date Range"}
        </label>
        <DatePicker
          onKeyDown={(e) => {
            e.preventDefault();
          }}
          dateFormat={"dd/MM/yyyy"}
          id={label}
          className="cursor-pointer lg:w-[220px]"
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          maxDate={istodaymax ? today : null}
          minDate={istodayMin ? today : null}
          selectsRange
          open={open}
          readOnly={true}
          disabled={true}
        />
      </div>
      <label className="relative lg:right-[8px] md:right-[8px]" htmlFor={label}>
        {view ? (
          <svg
            className=""
            width="17"
            height="18"
            viewBox="0 0 17 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.07422 6.92317H15.3334"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.7536 10.0482H11.761"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.20279 10.0482H8.2102"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.6481 10.0482H4.65552"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.7536 13.1566H11.761"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.20279 13.1566H8.2102"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.6481 13.1566H4.65552"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.4331 1V3.63262"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.97212 1V3.63262"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.5906 2.26367H4.81677C2.46742 2.26367 1 3.57242 1 5.97809V13.2178C1 15.6613 2.46742 17.0003 4.81677 17.0003H11.5832C13.94 17.0003 15.4 15.684 15.4 13.2783V5.97809C15.4074 3.57242 13.9474 2.26367 11.5906 2.26367Z"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            className="cursor-pointer"
            width="17"
            height="18"
            viewBox="0 0 17 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleOpen}
          >
            <path
              d="M1.07422 6.92317H15.3334"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.7536 10.0482H11.761"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.20279 10.0482H8.2102"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.6481 10.0482H4.65552"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.7536 13.1566H11.761"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.20279 13.1566H8.2102"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.6481 13.1566H4.65552"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.4331 1V3.63262"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.97212 1V3.63262"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.5906 2.26367H4.81677C2.46742 2.26367 1 3.57242 1 5.97809V13.2178C1 15.6613 2.46742 17.0003 4.81677 17.0003H11.5832C13.94 17.0003 15.4 15.684 15.4 13.2783V5.97809C15.4074 3.57242 13.9474 2.26367 11.5906 2.26367Z"
              stroke="#141C4C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </label>
    </div>
    // </ClickAwayListener>
  );
};
