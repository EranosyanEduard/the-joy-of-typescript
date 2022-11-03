interface CustomType<T> {
    value: T
}

type Factory<T> = () => T

/**
 * @description
 * Тип, представляющий nullable-значение.
 */
type Nullable<T> = T | null | undefined

/**
 * @description
 * Тип, представляющий пару значений.
 */
type Pair<A, B = A> = [A, B]

type Predicate<V = unknown> = (v: V) => boolean
