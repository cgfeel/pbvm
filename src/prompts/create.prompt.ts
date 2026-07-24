import { input, select } from '@inquirer/prompts'
import { CreateOptions } from '../types/index.js'
import { logger } from '../utils/logger.js'

export async function promptCreateOptions(
  partial: CreateOptions
): Promise<Required<CreateOptions>> {
  let { name, template } = partial
  if (!name) {
    name = await input({
      message: logger.cyan('请输入实例名称：') + logger.gray(' [留空动态生成]'),
      default: '',
    })
  }

  if (!template) {
    template = await select({
      message: logger.cyan('请选择模版类型'),
      choices: [
        { name: 'Node', value: 'node' },
        { name: 'Python', value: 'python' },
        { name: 'Go', value: 'go' },
      ],
    })
  }

  return { name, template }
}
