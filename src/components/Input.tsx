import { TextField } from "@mui/material";
import React from "react";

const Input = ({
  width,
  name,
  value,
  type,
  disabled,
  handleChange,
  label,
  readOnly,
  error,
  helperText,
 
}: any) => {
  return (
    <div className={`${width}`}>
      <TextField
        disabled={disabled}
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        error={error}
        helperText={helperText}
        label={label}
        variant="outlined"
        inputProps={{ readOnly, autoComplete: "off" }}
        sx={{
          width: "100%",
          "& .MuiOutlinedInput-root": {
            height: "46px",
            backgroundColor: "white",
            borderRadius: "0px",
            "& > fieldset": {
              borderColor: "#E5E7EB",
            },
          },
          "& .MuiFormLabel-root": {
            marginTop: "-3px",
            // fontWeight: 500,
          },
        }}
      />
    </div>
  );
};

export default Input;
