/** @type {import('next').NextConfig} */
const nextConfig = {
   // ✅ Added here

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pirstore.s3.amazonaws.com",
        pathname: "/pirstore/**",
      },
      {
        protocol: "https",
        hostname: "pirstore.s3.us-west-2.amazonaws.com",
        pathname: "/pirstore/**",
      },
    ],
  },

  async rewrites() {
    const awsBase = process.env.NEXT_PUBLIC_AWS_API_URL;

    return [
      { source: "/aws/location", destination: `${awsBase}location` },
      { source: "/aws/categoriesitem", destination: `${awsBase}categoriesitem` },
      { source: "/aws/itemdetails", destination: `${awsBase}itemdetails` },

      // ✅ OrderService routes
      { source: "/aws/verifyitemavailability", destination: `${awsBase}verifyitemavailability` },
      { source: "/aws/runpayment", destination: `${awsBase}runpayment` },
      { source: "/aws/createaccount", destination: `${awsBase}createaccount` },
      { source: "/aws/createstoredpayment", destination: `${awsBase}createstoredpayment` },
      { source: "/aws/createorder", destination: `${awsBase}createorder` },
      { source: "/aws/createitems", destination: `${awsBase}createitems` },
      { source: "/aws/createorderpayment", destination: `${awsBase}createorderpayment` },
      { source: "/aws/sendwelcomeemail", destination: `${awsBase}sendwelcomeemail` },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
