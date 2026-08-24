const createNextIntlPlugin = require('next-intl/plugin')

const nextConfigI18n = {
  locales: ['es', 'en', 'fr', 'pt'],
  defaultLocale: 'es',
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@formatjs/react-intl'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
