"use client";

import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { FaGreaterThan } from "react-icons/fa6";

const Policies = () => {
  const policies = [
    {
      title: "Pickup & Drop-off",
      content:
        "All of our rental items are picked up and dropped off at our location in American Fork by the customer: 896 S Auto Mall Dr, American Fork, UT 84003. " +
        "We do not offer pickup or delivery services. No refunds or discounts will be offered for a misunderstanding of this information. " +
        "We make every effort to ensure every customer is aware of this information by taking special care to mention it during every inquiry, " +
        "posting it in SEVERAL locations on our website, and through the reminder emails we send to every customer. <br/><br/>" +
        "We load all customers at pickup (so you don't need to bring help). <br/><br/>" +
        "We generally have an after-hours drop-off location available for our renters to use. This allows our customers to return their items " +
        "at their convenience before the due day/time. When utilizing the after-hours drop-off, the customer is responsible for unloading the rented items " +
        "by themselves, and responsibility is still assumed for the rented items until they are properly checked in by a Plan-it Rentals employee " +
        "during normal business hours. No refunds or discounts will be given for returning rented items early. " +
        "If you need assistance unloading your items at drop-off, there is always a drop-off window where we are available to assist " +
        "(you will just need to come during that window if you need assistance). It is your responsibility to pass the drop-off information " +
        "along to anyone who may be dropping off for you. Our after-hours procedure changes based on time of year, volume, and other factors - " +
        "so do not assume it is the same as when you rented a previous time.<br/><br/> Our pricing is for full-day rentals, so our reservation windows " +
        "should easily cover your event. Please don't ask for exceptions to our pickup and drop-off times.",
    },
    {
      title: "Renter Requirements",
      content:
        "All renters must be 18 years of age or older. A valid driver's license is required at pickup. We reserve the right to refuse service to anyone, for any reason. Valid payment must be presented and payment completed before leaving our premise with the rented items. Our rental agreement must also be completed before departing.",
    },
    {
      title: "Transportation Requirements",
      content:
        "The customer is responsible for the transportation of the rented items. Adequate space should be allocated for each reserved item. Plan-it Rentals can recommend the space/vehicle needed, and our website also provides the recommended vehicle size for each item. However, we don't know every vehicle or what else might be in the vehicle; so it is the customer's responsibility to arrive with enough cargo space.<br/><br/> No refunds or discounts will be given for items that are unable to be transported due to inadequate cargo space. Plan-it Rentals' employees will help load and secure the rental items, but any damage done to our products during transportation is the responsibility of the customer.<br/><br/>There are times where our employees will not feel comfortable loading items. Especially when there is limited space, it risks damage to your vehicle or our products. So, we plead and ask that you come with more than enough cargo space for the rented items and you understand that any damage to your vehicle is your responsibility. We ask you to be understanding when our employees don't feel comfortable loading an item.",
    },
    {
      title: "Cleaning",
      content:
        "Rented items must be returned clean, dry, and in the same working condition as when they were taken. We reserve the right to charge any fees associated with the cleaning, repair, or replacement of the rented items.",
    },
    {
      title: "Cancellation/Deposit Policy",
      content:
        "Items are only reserved with a deposit. If a deposit has not been paid, items are available only on a first come, first served basis. We have the best cancellation policy out there!<br/><br/>Your deposit will be fully refunded if the rented items are able to be rented to someone else. That means, the more notice we are given - the more likely a refund will be issued. That refund will only be issued once the item has been picked up and paid for by the replacement customer. If we are unable to rent the item to another customer, 100% of the deposit can be used as a future credit on any rental, and on any item! An additional deposit must still be collected to reserve another item, and the credit will be used on the remaining balance that is due at pickup.<br/><br/>If a reservation is cancelled after 9:00am the day PRIOR to your pickup day (24 hours before reservation), then 100% of the deposit is forfeited (no refund and no issued credit). In case of inclement weather, the 24hr cancellation policy will be waived and the deposit can be used as a future credit (unless we are able to re-rent the items to another customer, then a full refund will be issued). It is suggested that you arrange an alternate, indoor location for your event in case of weather. Determining what classifies as inclement weather and the waiving of the 24hr cancellation policy is at the discretion of Plan-it Rentals.",
    },
    {
      title: "Holiday Pricing & Details",
      content:
        "Many holidays have different pickup/drop-off times and different pricing may also apply. Some holidays are our busiest days, so in order to accommodate our volume, staff, and our customers - we have different policies for those days.<br/><br/>For more details on our holidays, pricing, and other information, see below:",
    },
    {
      title: "Summary",
      content:
        "We truly appreciate you considering Plan-it Rentals for your event. We work VERY hard to ensure each rental is successful, and that every customer is treated with excellence. We firmly believe our pricing, policies, customer service, and products are the best out there, and we hope you will come see that for yourself!<br/><br/>You can be sure we will take full responsibility for our short-comings, and we always error on the side of generosity and making sure our customers are taken care of. We do hope that our customers will also return the favor by being ethical and honest, thus keeping our pricing low and policies and procedures to a minimum.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Policies | Planitrentals</title>
        <meta
          name="description"
          content="Save big by reserving one of our package deals today!"
        />
        <meta name="keywords" content="Party Rentals, Equipment Rentals" />
        <meta property="og:title" content="Policies | Planitrentals" />
        <meta
          property="og:description"
          content="Save big by reserving one of our package deals today!"
        />
        <meta
          property="og:url"
          content="https://www.planitrentals.com/policies"
        />
        <link rel="canonical" href="https://www.planitrentals.com/policies" />
      </Head>

      <div className="relative">
        <div className=" page-header breadcrumb-wrap relative z-10 md:mt-[100px]">
          <div className="flex flex-wrap gap-2 text-sm font-semibold pb-1 text-blue-950">
            <Link href="/" className="text-green-600 hover:underline">
              Home
            </Link>
            <FaGreaterThan className="mt-1" />
            <span className="text-blue-900">Policies</span>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8">
          <div className="space-y-4 mb-5 m-4 md:m-10">
            {policies.map((policy, index) => (
              <div
                key={index}
                className="bg-white border border-green-400 rounded-lg shadow-md"
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center p-4 text-left font-semibold text-blue-950 transition duration-300 ease-in-out hover:bg-gray-100 rounded-lg"
                >
                  <span>{policy.title}</span>
                  <span className="text-lg font-bold">
                    {activeIndex === index ? "−" : "+"}
                  </span>
                </button>

                {activeIndex === index && (
                  <div
                    className="p-4 bg-gray-50 text-blue-950 text-mb leading-relaxed border-t border-gray-200 rounded-b-lg text-justify"
                    dangerouslySetInnerHTML={{ __html: policy.content }}
                  />
                )}

                {policy.title === "Holiday Pricing & Details" &&
                  activeIndex === index && (
                    <div className="p-4 bg-gray-50 text-blue-700 text-sm border-t border-gray-200 text-justify">
                      <Link
                        href="/holidays"
                        className="text-blue-700 font-semibold hover:underline"
                      >
                        Click here
                      </Link>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Policies;
