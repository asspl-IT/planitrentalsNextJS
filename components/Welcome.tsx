"use client";

import React from "react";

const Welcome = () => {
  const phoneNumber = "801-319-5524";

  const formattedPhone = phoneNumber.split("-").map((segment, index, arr) => (
    <React.Fragment key={index}>
      {segment}
      {index < arr.length - 1 && <>-<wbr /></>}
    </React.Fragment>
  ));

  const welcomeText = `We are Utah's best source for rentals of any kind! We are located in American Fork, Utah and rent to customers from all over Utah and those visiting our beautiful state for recreation and fun. Birthday parties, family reunions, company parties, anniversaries, or any get together can be enhanced with one of our rentals. We have everything from photo booths to bounce houses, sound systems, inflatable movie screens, shave ice machines, cotton candy machines, zorb soccer balls, lasertag and much more. Plan amazing events with one of our many items like: dunk tanks, foam machines, cornhole, fog machines, soft serve machine, and much more! You can rent all that and more at Plan-it Rentals. Please take some time and browse through our website and let us know if you have any questions about our rental services. We would be happy to answer them! Call or text us at `;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <h1 className="text-[40px] md:text-3xl text-center font-bold pirBlue--text mb-4">
        Welcome
      </h1>

      <p className="pirBlue--text text-[15px] leading-6 text-justify">
        {welcomeText}
        <span className="static-phone">{formattedPhone}</span>
      </p>
    </div>
  );
};

export default Welcome;
