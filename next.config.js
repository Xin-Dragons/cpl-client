module.exports = {
  images: {
    domains: ['cdn.magiceden.io', 'arweave.net', 'fvncezpefoxrbaqqtanr.supabase.co'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      return config
    }
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
        },
      }
    }
  }
}