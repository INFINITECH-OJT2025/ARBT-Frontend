/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
      domains: ["127.0.0.1", "localhost"], // ✅ Allow local Laravel images
      
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  
};
module.exports = nextConfig;


