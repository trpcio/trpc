module.exports = {
  async redirects() {
    return [
      {
        source: '/docs/procedures',
        destination: '/docs/router',
        permanent: true,
      },
      {
        source: '/docs/create-react-app',
        destination: '/docs/react',
        permanent: true,
      },
      {
        source: '/docs/react-queries-and-mutations',
        destination: '/docs/react-queries',
        permanent: true,
      },
    ];
  },
};
