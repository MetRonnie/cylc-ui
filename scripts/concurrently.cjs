/* eslint-disable no-console */
const concurrently = require('concurrently')

const args = process.argv.slice(2)
const { VITE_OPTIONS } = process.env

const allCommands = {
  'serve:jupyterhub': {
    command: 'pnpm run serve:jupyterhub',
    name: 'SERVER',
    prefixColor: 'yellow'
  },
  'serve:vue': {
    command: `pnpm run serve:vue ${VITE_OPTIONS ?? ''}`,
    name: 'VITE',
    prefixColor: 'blue'
  },
  preview: {
    command: `pnpm exec vite preview --mode offline ${VITE_OPTIONS ?? ''}`,
    name: 'VITE',
    prefixColor: 'blue'
  },
  'e2e:open': {
    command: 'pnpm exec cypress open --e2e',
    name: 'TESTS',
    prefixColor: 'magenta'
  },
  'cy:run': {
    command: 'pnpm exec cypress run',
    name: 'TESTS',
    prefixColor: 'cyan'
  }
}

concurrently(
  args.map((arg) => allCommands[arg]),
  {
    successCondition: 'first',
    killOthersOn: ['success', 'failure'],
  }
)
