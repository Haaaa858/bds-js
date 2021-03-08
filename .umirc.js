export default {
  exportStatic: {},
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
      'antd',
    ],
    [
      'babel-plugin-import',
      {
        libraryName: '@alifd/next',
        style: false,
      },
      'fusion',
    ],
  ],
  mode: 'site',
  title: 'BDSJS',
  favicon: '/favicon-32x32.ico',
  logo: '/logo.png',
  dynamicImport: {},
  manifest: {},
  hash: true,
  resolve: {
    includes: ['docs', 'packages/utils'],
  },
  locales: [['zh-CN', '中文']],
  links: [
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/@alifd/theme-design-pro@0.6.2/dist/next-noreset.min.css',
    },
    { rel: 'stylesheet', href: '/style.css' },
  ],
  navs: {
    'zh-CN': [null],
  },
  headScripts: ['https://s4.cnzz.com/z_stat.php?id=1278992092&web_id=1278992092'],
};
