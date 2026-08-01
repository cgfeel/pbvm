export type PickVariants<T, K extends keyof GetVariants<T>> = [K] extends [never]
  ? never
  : {
      [P in K]: PickVariantItem<T, P>
    }

export type PickVariantItem<T, K extends keyof GetVariants<T>> = NonNullable<GetVariants<T>[K]>

type GetVariants<T> = T extends (...args: [infer P, ...unknown[]]) => unknown
  ? NonNullable<P>
  : never
