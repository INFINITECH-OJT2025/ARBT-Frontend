/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["127.0.0.1", "localhost"], // ✅ Allow local Laravel images
      },
};

module.exports = nextConfig;



