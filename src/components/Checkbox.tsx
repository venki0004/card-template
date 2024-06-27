import React from "react";
import PropTypes from "prop-types";
const CheckBox = ({ onClick, boolValue, label }: any) => {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer flex items-center gap-2"
    >
      <img
        width={18}
        height={18}
        // className="lg:w-5 lg:h-5 w-4 h-4"
        src={
          boolValue
            ? "/assets/icons/checkedIcon.svg"
            : "/assets/icons/uncheckedIcon.svg"
        }
        alt={
          boolValue
            ? "/assets/icons/checkedIcon.svg"
            : "/assets/icons/uncheckedIcon.svg"
        }
      />
      <p
        className={`${
          boolValue ? "text-primaryBlue" : "text-secondaryGray"
        } text-sm  select-none`}
      >
        {label}
      </p>
    </button>
  );
};
export default CheckBox;

CheckBox.propTypes = {
  onClick: PropTypes.func.isRequired,
  boolValue: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
};
