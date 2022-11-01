interface CustomType<T> {
    value: T
}

type Factory<T> = () => T

/**
 * @description
 * Тип, представляющий nullable-значение.
 */
type Nullable<T> = T | null | undefined

type Predicate<V = unknown> = (v: V) => boolean
