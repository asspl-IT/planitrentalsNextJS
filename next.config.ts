/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pirstore.s3.amazonaws.com",
        pathname: "/pirstore/**",
      },
      {
        protocol: "https",
        hostname: "pirstore.s3.us-west-2.amazonaws.com", // optional if some images use this
        pathname: "/pirstore/**",
      },
    ],
  },
};

export default nextConfig;
