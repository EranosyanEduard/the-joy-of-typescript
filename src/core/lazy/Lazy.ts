declare const LAZY: unique symbol

class Lazy<T> implements CustomType<T> {
    readonly value!: T

    constructor(f: Factory<T>) {
        const VOID = Symbol('VOID')
        let value: T | typeof VOID = VOID

        Object.defineProperty(this, 'value', {
            get(): T {
                if (value === VOID) value = f()
                return value
            }
        })
    }

    flatMap<U>(f: (v: T) => Lazy<U>): Lazy<U> {
        return new Lazy(() => f(this.value).value)
    }

    map<U>(f: (v: T) => U): Lazy<U> {
        return new Lazy(() => f(this.value))
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    private [LAZY]!: void
}

const lazy = <T>(f: Factory<T>): Lazy<T> => new Lazy(f)

export default Lazy
export { lazy }
