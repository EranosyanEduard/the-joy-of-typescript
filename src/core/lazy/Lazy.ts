declare const LAZY: unique symbol
const VOID = Symbol('VOID')

class Lazy<T> {
    readonly value: () => T

    constructor(f: () => T) {
        let value: T | typeof VOID = VOID

        this.value = () => {
            if (value === VOID) {
                value = f()
            }
            return value
        }
    }

    flatMap<U>(f: (v: T) => Lazy<U>): Lazy<U> {
        return new Lazy(() => f(this.value()).value())
    }

    map<U>(f: (v: T) => U): Lazy<U> {
        return new Lazy(() => f(this.value()))
    }

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    private [LAZY]!: void
}

export default Lazy
