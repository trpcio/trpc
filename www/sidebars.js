module.exports = {
  docs: [
    {
      type: 'category',
      label: 'tRPC',
      collapsed: false,
      items: [
        'main/introduction',
        'main/quickstart',
        'nextjs/intro',
        'react/intro',
        'main/example-apps',
        'main/contributing',
      ],
    },
    {
      type: 'category',
      label: '@trpc/server',
      collapsed: false,
      items: [
        'server/router',
        'server/merging-routers',
        'server/context',
        'server/middlewares',
        'server/authorization',
        'server/error-handling',
        'server/error-formatting',
        'server/data-transformers',
        'server/caching',
        'server/express',
        'server/fastify',
      ],
    },
    {
      type: 'category',
      label: '@trpc/client',
      collapsed: false,
      items: ['client/vanilla', 'client/links'],
    },

    {
      type: 'category',
      label: '@trpc/react',
      collapsed: false,
      items: [
        'react/queries',
        'react/mutations',
        'react/useInfiniteQuery',
        'react/invalidateQuery',
      ],
    },
    {
      type: 'category',
      label: '@trpc/next',
      collapsed: false,
      items: ['nextjs/ssr', 'nextjs/ssg', 'nextjs/starter-projects'],
    },
    'further/further-reading',
  ],
};
