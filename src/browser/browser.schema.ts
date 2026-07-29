import z from 'zod'

export const baseConnectionSchema = z.object({
  id: z.number(),
  method: z.string().optional(),
  params: z.record(z.string(), z.unknown()).optional(), // ← 响应里没有
  sessionId: z.string().optional(), // ← 响应里没有
})

export const capabilitiesSchema = z.object({
  capabilities: z
    .object({
      browserVersion: z.string({ error: 'BiDi browserVersion must be string' }),
    })
    .optional(),
})

export const chromiumConnectionSchema = baseConnectionSchema.extend({
  error: z.object({ code: z.number(), message: z.string() }).optional(),
  result: z.record(z.string(), z.unknown()).optional(),
})

export const envValueSchema = z.object({
  result: z.object().optional(),
})

export const firefoxConnectionSchema = baseConnectionSchema.extend({
  error: z.string().optional(),
  result: z.record(z.string(), z.unknown()).optional(),
})

export const sessionIdSchema = z.object(
  {
    sessionId: z
      .string({ error: 'CDP sessionId must be string.' })
      .min(1, { error: "CDP sessionId can't be empty." }),
  },
  {
    error: "CDP can't find sessionId.",
  }
)

export const targetInfosSchema = z.object({
  targetInfos: z
    .array(
      z.object(
        {
          targetId: z.string({ error: 'CDP target id must be string.' }),
          type: z.string({ error: 'CDP target type must be string.' }),
        },
        {
          error: 'CDP target info item must be object.',
        }
      ),
      {
        error: 'CDP target infos must be array.',
      }
    )
    .optional(),
})

export const remoteValueSchema: z.ZodType<RemoteValue> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('string'),
      value: z.string(),
    }),

    z.object({
      type: z.literal('number'),
      value: z.number(),
    }),

    z.object({
      type: z.literal('boolean'),
      value: z.boolean(),
    }),

    z.object({
      type: z.literal('null'),
    }),

    z.object({
      type: z.literal('undefined'),
    }),

    z.object({
      type: z.literal('object'),
      value: z.array(z.tuple([z.string(), remoteValueSchema])),
    }),

    z.object({
      type: z.literal('array'),
      value: z.array(remoteValueSchema),
    }),

    z.object({
      type: z.literal('bigint'),
      value: z.string(),
    }),

    z.object({
      type: z.literal('map'),
      value: z.array(z.tuple([z.string(), remoteValueSchema])),
    }),

    z.object({
      type: z.literal('set'),
      value: z.array(remoteValueSchema),
    }),
  ])
)

export const innerResultSchema = z.object(
  {
    type: z.string({ error: 'BiDi inner result type must be string.' }),
    result: remoteValueSchema.optional(),
    exceptionDetails: z.object({ text: z.string() }).optional(),
  },
  {
    error: 'BiDi inner result must be object.',
  }
)

export type RemoteValue =
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'null' }
  | { type: 'undefined' }
  | { type: 'object'; value: Array<[string, RemoteValue]> }
  | { type: 'array'; value: RemoteValue[] }
  | { type: 'bigint'; value: string }
  | { type: 'map'; value: Array<[string, RemoteValue]> }
  | { type: 'set'; value: RemoteValue[] }
