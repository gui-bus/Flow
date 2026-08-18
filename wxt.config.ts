import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Flow',
    description: 'Automatização inteligente de preenchimento de candidaturas.',
    version: '1.0.0',
    permissions: ['storage', 'activeTab'],
    action: {
      default_title: 'Abrir Flow',
      default_icon: {
        '16': 'icon/16.png',
        '32': 'icon/32.png',
        '48': 'icon/48.png',
        '128': 'icon/128.png',
      },
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '128': 'icon/128.png',
    },
  },
});


