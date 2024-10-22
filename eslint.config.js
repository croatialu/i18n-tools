// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
  },
  {
    files: ['fixtures/**/*.yaml'],
    rules: {
      'yml/no-irregular-whitespace': 'off',
      'no-irregular-whitespace': 'off',
    },
  },
)
