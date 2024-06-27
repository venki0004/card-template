import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormHelperText from '@mui/material/FormHelperText';

export default function SelectInput({
  name,
  value,
  error,
  helperText,
  label,
  handleChange,
  options,
  readOnly,
  disabled,
}: any) {
  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth>
        <InputLabel
          sx={{
            marginTop: "-3px",
            fontSize: "16px",
          }}
          id="select-label"
        >
          {label}
        </InputLabel>
        <Select
          disabled={disabled}
          readOnly={readOnly}
          error={error}
          labelId="select-label"
          id="select-value-comp"
          name={name}
          value={value}
          label={label}
          onChange={handleChange}
          sx={{
            textAlign: "start",
            borderRadius: "0px",
            height: "46px",
            borderColor: "#E5E7EB",
            backgroundColor: "#ffffff"
          }}
        >
          {React.Children.toArray(
            options?.length > 0 ? (
              options?.map((item:any) => (
                <MenuItem value={item?.id ? item?.id : item?.name}>{item?.name}</MenuItem>
              ))
            ) : (
              <p className="w-full text-center">Not Found..</p>
            )
          )}
        </Select>
         {
          helperText ? <FormHelperText>
            <p className="text-[#d32f2f]">{helperText}</p>
          </FormHelperText> : <></>
         }
        
      </FormControl>
    </Box>
  );
}
