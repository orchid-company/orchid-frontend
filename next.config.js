/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            "applore-dev-projects-1.s3.amazonaws.com",
            "applore-dev-projects-1.s3.ap-south-1.amazonaws.com",
            "applore-dev-projects-3.s3.ap-south-1.amazonaws.com",
            "orchid-assets-3.s3.ap-south-1.amazonaws.com",
            "strapi.orchidcompany.com",
            "i.postimg.cc",
            "localhost",
            'orchid-assets1.s3.ap-south-1.amazonaws.com',
            "orchid-assets1.s3.amazonaws.com"
            // Add more domains if needed
        ],
    },

    env: {
        backendUrl: "https://api.orchidcompany.com/api",
        // backendUrl: "http://localhost:9000/api",
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
};



module.exports = nextConfig;
