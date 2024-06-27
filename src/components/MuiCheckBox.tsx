import React from "react";
import Checkbox from "@mui/material/Checkbox";
import { makeStyles } from "@mui/styles";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const useStyles = makeStyles(() => ({
  root: {
    padding: 0,
    "&:hover": {
      backgroundColor: "rgba(0, 133, 255, 0.1) !important",
    },
  },
}));

const CustomCheckbox = ({
  defaultChecked,
  handleCheck,
  isChecked,
  Label,
  name,
  color,
  readonly,
}: any) => {
  const classes = useStyles();
  return (
    <div className="flex items-center">
      <Checkbox
        icon={
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="0.75"
              y="0.75"
              width="18.5"
              height="18.5"
              rx="0"
              stroke="#3C567E"
            />
          </svg>
        }
        checkedIcon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <rect
              x="0.75"
              y="0.75"
              width="20"
              height="20"
              rx="0"
              ry="0"
              fill="#1976d2"
            />
            <path fill="#FFF" d="M7 10l2 2 5-5 1.5 1.5-6.5 6.5-3.5-3.5 1-1z" />
          </svg>
        }
        sx={{
          "& .MuiSvgIcon-root": {
            fontSize: 70,
            borderRadius: 20,
          },
        }}
        disabled={readonly}
        name={name}
        id={Label}
        checked={isChecked}
        className={classes.root}
        defaultValue={defaultChecked}
        {...label}
        onChange={handleCheck}
      />

      <label
        className={` ml-2  break-word sm:text-sm text-xs   ${
          isChecked ? "text-WaterBlue" : `${color}`
        }`}
      >
        {Label}
      </label>
    </div>
  );
};

export default CustomCheckbox;