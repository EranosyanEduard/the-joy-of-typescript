import { singleton } from 'src/utils/decorators'

abstract class Option<T> {
    static new<T>(value: T | null = null): Option<T> {
        return value === null ? Option.None.instance() : new Option.Some(value)
    }

    filter(p: Predicate<T>): Option<T> {
        return this.flatMap((value) => (p(value) ? this : Option.new()))
    }

    flatMap<U>(f: (value: T) => Option<U>): Option<U> {
        return this.map(f).getOrElse(() => Option.new())
    }

    isNotEmpty(): this is Option.Some<T> {
        return !this.isEmpty
    }

    orElse(f: Factory<Option<T>>): Option<T> {
        return this.map(() => this as Option<T>).getOrElse(f)
    }

    abstract get isEmpty(): boolean
    abstract getOrElse(f: Factory<T>): T
    abstract map<U>(f: (value: T) => U): Option<U>
}

namespace Option {
    export class Some<T> extends Option<T> {
        readonly #value: T

        constructor(value: T) {
            super()
            this.#value = value
        }

        get isEmpty(): boolean {
            return false
        }

        getOrElse(f: Factory<T>): T {
            return this.#value
        }

        map<U>(f: (value: T) => U): Option<U> {
            return new Some(f(this.#value))
        }
    }

    @singleton
    export class None extends Option<never> {
        static instance: () => None

        get isEmpty(): boolean {
            return true
        }

        getOrElse<T>(f: Factory<T>): T {
            return f()
        }

        map<U>(f: (value: never) => U): Option<U> {
            return this
        }
    }
}

const map2 = <A, B, C>(a: Option<A>, b: Option<B>, f: (a: A) => (b: B) => C): Option<C> => {
    return a.flatMap((itA) => b.map((itB) => f(itA)(itB)))
}

export default Option
export { map2 }
