import { confirm, input, number, select } from '@inquirer/prompts'

async function main() {
  // 文本输入
  const name = await input({
    message: '请输入你的名字',
    default: '访客',
  })

  // 数字输入
  const age = await number({
    message: '请输入你的年龄',
  })

  // 单选项
  const favorite = await select({
    message: '你喜欢的语言？',
    choices: [
      { name: 'TypeScript', value: 'ts' },
      { name: 'JavaScript', value: 'js' },
      { name: 'Go', value: 'go' },
    ],
  })

  const ok = await confirm({
    message: '确认提交信息？',
    default: true,
  })

  if (ok) {
    console.log('\n===== 收集信息 =====')
    console.log({ name, age, favorite })
  } else {
    console.log('已取消')
  }
}

main().catch((err) => {
  if (err instanceof Error && err.name === 'ExitPromptError') {
    return
  }
  console.error(err)
})
