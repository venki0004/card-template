import * as React from "react";
import { Link } from "react-router-dom";

const BreadCrumb = ({ links }: any) => (
  <div role="presentation">
    <p className="flex justify-start items-center">
      {links?.map((item: any, i: any, arr: any) => (
        <div key={item?.url}>
          {i !== arr.length - 1 ? (
            <div>
              <Link
                className="font-onestRegular text-xs text-Kimberly cursor-pointer"
                to={item?.url}
              >
                {item?.path}
              </Link>
              <span className="px-1 font-onestRegular text-xs text-Kimberly">
                {">"}
              </span>
            </div>
          ) : (
            <a className="font-onestRegular text-xs text-Kimberly">
              {item?.path}
            </a>
          )}
        </div>
      ))}
    </p>
  </div>
);

export default BreadCrumb;
