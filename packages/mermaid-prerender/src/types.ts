import type { MermaidConfig } from 'mermaid'

export interface RenderPayload extends Required<Pick<MermaidConfig, 'theme'>> {
  source: string
}

export type WorkerMessage = { id: string; payload: RenderPayload }
