import React from "react";
import CardListing from "./Table";

const ManageCards = ({ id }: any) => {
  return (
    <div className="bg-white p-3 lg:p-6">
      <p className="text-lg font-bold">Manage Cards</p>
      <div className=" bg-lightshadedGray mt-2 p-6">
        <CardListing id={id} />
      </div>
    </div>
  );
};

export default ManageCards;
