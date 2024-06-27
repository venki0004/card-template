import React from "react";

const SelectRadio = ({
  value,
  label,
  onClick,
  options,
  disabled,
  readOnly,
  error
}: any) => {
  return (
    <div
      className={`w-full border ${error ? 'border-[#d32f2f]' : 'border-[#E5E7EB]'} flex items-center justify-between px-3 h-[46px] ${disabled ? "pointer-events-none opacity-50" : ""
        }`}
    >
      <div>
        <p className={`text-base  ${error ? 'text-[#d32f2f]' : 'text-secondaryGray'}`}>{label}</p>
      </div>

      <div className="flex items-center gap-4">
        {React.Children.toArray(
          options.map((item: any) => (
            <button
              disabled={disabled}
              onClick={() => {
                readOnly ? "" : onClick(item.value);
              }}
              className={`flex items-center gap-2 select-none ${readOnly ? "cursor-default" : "cursor-pointer"
                } `}
            >
              <img
                src={
                  value === item.value
                    ? "/assets/icons/radioActive.svg"
                    : "/assets/icons/radioInactive.svg"
                }
                alt="radioActive"
                className="w-4 h-4"
              />
              <p
                className={`${value === item.value
                    ? "text-primaryBlue"
                    : "text-secondaryGray"
                  } text-sm font-medium`}
              >
                {item.name}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default SelectRadio;