/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/NRRC' : '',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

module.exports = nextConfig; 