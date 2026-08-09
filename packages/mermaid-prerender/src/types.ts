import type { MermaidConfig } from 'mermaid'

// name 是主题名称，作为输出的主题目录
export interface MermaidTheme extends Required<Pick<MermaidConfig, 'theme'>> {
  name: string
}

// source 是需要渲染的 svg 图表数据
export interface RenderPayload extends Required<Pick<MermaidConfig, 'theme'>> {
  source: string
}

export type CompilerMode = 'development' | 'production' | 'none'
export type TargetType = false | string | string[]
export type WorkerMessage = { id: string; payload: RenderPayload }
