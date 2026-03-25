/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during production builds — we run it in CI separately
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore type errors during production builds — tsc runs in pre-check
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
