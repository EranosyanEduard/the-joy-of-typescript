interface CustomType<T> {
    value: T
}

type Factory<T> = () => T

type Predicate<V = unknown> = (v: V) => boolean
