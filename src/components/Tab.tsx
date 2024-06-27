import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";


const useStyles = makeStyles({
  tabs: {
    backgroundColor: "white",
    "& .MuiTabs-indicator": {
      backgroundColor: "#0C8EC7",
    },
    "& .MuiTabs-flexContainer button": {
      width: "13rem !important",
    },
    "& .MuiTab-root.Mui-selected": {
      color: "#0C8EC7",
      fontFamily: "",
      fontWeight: "700",
    },
    "& .MuiButtonBase-root": { textTransform: "none" },
  },
});
let px = "20px";
function CustomTabPanel(props:any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: "20px" }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index:any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({ cols, data }:any) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event:any, newValue:any) => {
    setValue(newValue);
  };

  const classes = useStyles();

  return (
    <Box
      sx={{ width: "100%" }}
      className={`w-full h-full`}
    >
      <Box>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          className={classes.tabs}
          sx={{
            border: 1,
            borderColor: "rgba(47, 72, 110, 0.1)",
            backgroundColor: "white !important",
            "& .MuiTabs-indicator": {
              backgroundColor: "#0C8EC7",
            },
            "& .MuiTabs-flexContainer button": {
              width: "14rem !important",
              fontFamily: "Onest Regular !important",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "#0C8EC7",
              fontFamily: "Onest Regular !important",
              fontWeight: "700",
            },
            "& .MuiButtonBase-root": { textTransform: "none" },
          }}
        >
          {cols?.map((item:any, index:any) => (
            <Tab
              key={index}
              sx={{
                color: "#141C4C",
                fontSize: "14px",
                marginRight: `${px}`,
                lineHeight: "25px",
              }}
              label={item?.title}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Box>

      {data?.map((item:any, index:any) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {item}
        </CustomTabPanel>
      ))}
    </Box>
  );
}
