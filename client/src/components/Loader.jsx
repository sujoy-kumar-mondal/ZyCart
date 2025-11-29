import React from "react";

const Loader = () => {
  return (
    <div className="w-full flex justify-center py-14">
      <div
        className="
          h-10 w-10 rounded-full animate-spin
          border-4 border-[#8FD6F6]
          border-t-transparent
        "
      ></div>
    </div>
  );
};

export default Loader;
