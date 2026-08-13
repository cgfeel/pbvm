import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'

if (ExecutionEnvironment.canUseDOM && process.env.NODE_ENV !== 'production') {
  import('eruda').then(({ default: eruda }) => eruda.init())
}
