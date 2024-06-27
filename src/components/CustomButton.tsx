import React from "react";

const CustomButton = ({
  text,
  classes,
  handleClick,
  disabled,
  loading = false,
  icon,
  type ='button',
}: any) => {
  return (
    <button
      onClick={handleClick}
      className={` ${disabled ? "bg-slate-300" : ""} ${classes} `}
      disabled={disabled || loading}
      type={type}
    >
      <p className="flex  gap-2 text-sm items-center justify-center">
        {loading ? (
          "Loading.."
        ) : (
          <>
            {icon ? icon : ""} {text}
          </>
        )}
      </p>
    </button>
  );
};

export default CustomButton;
