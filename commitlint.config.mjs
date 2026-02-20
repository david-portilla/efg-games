/** @type {import('@commitlint/types').UserConfig} */
const config = {
  parserPreset: {
    parserOpts: {
      // Why: custom ticket-based format EFG-XXX: description instead of conventional type/scope
      headerPattern: /^(EFG-\d+): (.+)$/,
      headerCorrespondence: ['ticket', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'efg-header-format': ({ header }) => {
          const valid = /^EFG-\d+: .+$/.test(header ?? '');
          return [valid, 'Commit message must match format: EFG-XXX: description'];
        },
      },
    },
  ],
  rules: {
    'efg-header-format': [2, 'always'],
    'header-max-length': [2, 'always', 100],
  },
};

export default config;
