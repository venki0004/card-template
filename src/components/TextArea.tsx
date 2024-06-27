import React from "react";

interface Props {
  placeholder?: string;
  id?: string;
  name?: string;
  rows: number;
  className?: string;
  value?: string;
  error?: boolean;
  handleChange?: any;
  readOnly?: any;
  helperText?: string;
}
const TextArea: React.FC<Props> = ({
  placeholder,
  id,
  name,
  rows,
  className,
  value,
  error,
  handleChange,
  helperText,
  readOnly,
}) => (
  <div className="relative">
    <textarea
      readOnly={readOnly}
      className={`font-redHatDisplayMedium w-full border border-border  ${
        className ? className : "bg-transparent"
      } rounded-xs  text-SpaceCadet p-4 placeholder-placeholder outline-none placeholder:text-Comet focus:border-[2px] focus:border-blue-600 hover:border-black ${className}  ${
        error &&
        "placeholder:font-redHatDisplayRegular border-red-600 placeholder:text-red-600"
      }`}
      name={name}
      id={id}
      rows={rows}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
    {helperText && (
      <p className="absolute -bottom-3 ml-4 text-red-600 text-xs">
        {helperText}
      </p>
    )}
  </div>
);

export default TextArea;

TextArea.defaultProps = {
  placeholder: "",
  id: "",
  name: "",
  className: "",
  value: "",
  error: false,
  handleChange: function test() {},
  helperText: "",
};
