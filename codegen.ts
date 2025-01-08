import type { CodegenConfig } from '@graphql-codegen/cli'
import dotenv from 'dotenv-flow'

dotenv.config({ silent: true })
const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_API_ENDPOINT,
  documents: ['src/graphql/**/*.graphql'],
  verbose: true,
  overwrite: true,
  generates: {
    'src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
      config: {
        namingConvention: 'keep',
      },
    },
  },
}
export default config
