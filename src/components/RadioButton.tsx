import { styled } from "@mui/material/styles";
import RadioGroup, { useRadioGroup } from "@mui/material/RadioGroup";
import FormControlLabel, {
  FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

const StyledFormControlLabel = styled((props: any) => (
  <FormControlLabel {...props} />
))(({ checked }) => ({
  ".MuiFormControlLabel-label": checked
    ? { color: "#0C8EC7" }
    : { color: "#141C4C" },
}));

const MyFormControlLabel = (props: any) => {
  const radioGroup = useRadioGroup();

  let checked = false;

  if (radioGroup) {
    checked = radioGroup.value === props.value;
  }

  return <StyledFormControlLabel checked={checked} {...props} />;
};

const RadioButton = ({
  items,
  name,
  onChange,
  checked,
  defaultValue,
  row,
}: any) => {
  return (
    <div className=" w-full">
      {" "}
      <RadioGroup name={name} defaultValue={defaultValue}>
        <div className={`${row ? "flex" : ""}`}>
          {" "}
          {React.Children.toArray(
            items.map((e: any) => (
              <MyFormControlLabel
                value={e?.value}
                label={e?.label}
                control={
                  <Radio
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(0, 133, 255, 0.1) ",
                      },
                      color: "#141C4C",
                      "&.Mui-checked": {
                        color: "#0C8EC7",
                      },
                    }}
                  />
                }
              />
            ))
          )}
        </div>
      </RadioGroup>
    </div>
  );
};

export default RadioButton;
