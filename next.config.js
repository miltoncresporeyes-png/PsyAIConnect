const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@formatjs/react-intl'],
  },

  images: {
    unoptimized: true,
  },

  async redirects() {
    const isWaitlistMode = process.env.WAITLIST_MODE === 'true';
    if (!isWaitlistMode) {
      return [];
    }

    return [
      {
        source: '/reservar/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/cita/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/buscar',
        destination: '/',
        permanent: false,
      },
      {
        source: '/buscar-con-cobertura',
        destination: '/',
        permanent: false,
      },
      {
        source: '/profesionales',
        destination: '/',
        permanent: false,
      },
      {
        source: '/profesional/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/registro',
        destination: '/#lista-espera',
        permanent: false,
      },
    ];
  },

  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000',
          },
        ],
      },
    ];
  },
};

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

module.exports = withNextIntl(nextConfig);
