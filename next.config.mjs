/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ybhcvnigiapmoqjdbibi.supabase.co",
      },
    ],
  },
};

export default nextConfig;
