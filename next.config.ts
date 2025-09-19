import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  experimental: {
    // Server Actions configuration
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3000', 
        'localhost:3001', 
        'snitinav.vercel.app',
        'snitinew.vercel.app' // Keep for backward compatibility during transition
      ]
    },
    // Disable CSS optimization to prevent critters error
    optimizeCss: false
  },
  
  // Bundle external packages
  transpilePackages: [
    'lucide-react',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-slot',
    '@radix-ui/react-avatar',
    '@prisma/client',
    'bcryptjs',
    '@t3-oss/env-nextjs'
  ],

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'localhost',
      'snitinav.vercel.app',
      'snitinew.vercel.app', // Keep for backward compatibility
      'yemsrezmtmewkfflckxn.supabase.co',
      'yemsrezmtmewkfflckxn.supabase.in',
      'lh3.googleusercontent.com', // For Google OAuth if used
      'avatars.githubusercontent.com' // For GitHub OAuth if used
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack configuration
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Prisma configuration for serverless environments
    if (isServer) {
      config.externals.push('_http_common');
    }

    // Bundle analyzer (only in development)
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      );
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
};

export default nextConfig;
