/** @type {import("prettier").Config} */
export default {
  // 1. Core Formatting (Slightly wider for Backend classes/Decorators)
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 120, // Backend often has longer lines (Decorators, DTOs)
  tabWidth: 2,

  // 2. Import Sorting (Group by: NestJS Core -> Domain -> Infra -> Utils)
  importOrder: [
    '^(@nestjs/(.*))$', // NestJS modules first
    '<THIRD_PARTY_MODULES>', // Other libs (TypeORM, etc.)
    '^@/modules/(.*)$', // Feature Modules
    '^@/common/(.*)$', // Guards, Interceptors, Pipes
    '^@/database/(.*)$', // Entities & DTOs
    '^[./]', // Relative imports
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  //! Tell the plugin: "Hey, I'm using TypeScript with Legacy Decorators"
  importOrderParserPlugins: ['typescript', 'decorators-legacy', 'classProperties'],

  plugins: ['@trivago/prettier-plugin-sort-imports'],
};
