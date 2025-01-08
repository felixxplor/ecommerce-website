/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost'],
    minimumCacheTTL: 60,
    disableStaticImages: true,
  },
  env: {
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    BACKEND_URL: process.env.BACKEND_URL,
    SITE_NAME: process.env.SITE_NAME,
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
    SESSION_TOKEN_LS_KEY: process.env.SESSION_TOKEN_LS_KEY,
    REFRESH_TOKEN_LS_KEY: process.env.REFRESH_TOKEN_LS_KEY,
    AUTH_TOKEN_SS_KEY: process.env.AUTH_TOKEN_SS_KEY,
    AUTH_TOKEN_EXP_SS_KEY: process.env.AUTH_TOKEN_EXP_SS_KEY,
    CLIENT_CREDENTIALS_LS_KEY: process.env.CLIENT_CREDENTIALS_LS_KEY,
    CLIENT_SESSION_SS_KEY: process.env.CLIENT_SESSION_SS_KEY,
    CLIENT_SESSION_EXP_SS_KEY: process.env.CLIENT_SESSION_EXP_SS_KEY,
    NONCE_KEY: process.env.NONCE_KEY,
    NONCE_SALT: process.env.NONCE_SALT,
  },
}

module.exports = nextConfig
