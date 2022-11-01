import Lazy, { lazy } from '../lazy/Lazy'
import List from '../list/List'

abstract class Stream<T> {
    static cons<T>(head: Lazy<T>, tail: Lazy<Stream<T>>): Stream<T> {
        return new Stream.Cons(head, tail)
    }

    static empty<T>(): Stream<T> {
        return new Stream.Empty()
    }

    /**
     * Создать бесконечный поток элементов типа **number**.
     * @param start - Начальное значение.
     */
    static from(start: number): Stream<number> {
        return Stream.iterate(start, (n) => n + 1)
    }

    /**
     * Создать бесконечный поток элементов типа **T**.
     * @param seed - Начальное значение.
     * @param f - Фабрика значений.
     */
    static iterate<T>(seed: T, f: (head: T) => T): Stream<T> {
        return Stream.cons(
            lazy(() => seed),
            lazy(() => Stream.iterate(f(seed), f))
        )
    }

    /**
     * Создать бесконечный поток элементов типа **T**.
     * @param f - Фабрика значений.
     */
    static repeat<T>(f: Factory<T>): Stream<T> {
        return Stream.cons(
            lazy(f),
            lazy(() => Stream.repeat(f))
        )
    }

    isNotEmpty(): this is Stream.Cons<T> {
        return !this.isEmpty
    }

    toList(): List<T> {
        return Stream.toList(this, List.new())
    }

    abstract get head(): Nullable<T>
    abstract get tail(): Nullable<Stream<T>>
    abstract get isEmpty(): boolean

    /**
     * Исключить из потока количество элементов, равное аргументу **num**.
     * @param num - Количество элементов.
     */
    abstract dropAtMost(num: number): Stream<T>

    /**
     * Исключить из потока первые n-элементов, для которых предикат **p** вернул
     * значение true.
     * @param p - Функция-предикат.
     */
    abstract dropWhile(p: Predicate<T>): Stream<T>

    /**
     * Определить присутствует ли в потоке хотя бы один элемент, для которого
     * предикат **p** вернет значение true.
     * @param p - Функция-предикат.
     */
    abstract exists(p: Predicate<T>): boolean

    /**
     * Взять из потока количество элементов, равное аргументу **num**.
     * @param num - Количество элементов.
     */
    abstract takeAtMost(num: number): Stream<T>

    /**
     * Взять из потока первые n-элементов, для которых предикат **p** вернул
     * значение true.
     * @param p - Функция-предикат.
     */
    abstract takeWhile(p: Predicate<T>): Stream<T>
}

namespace Stream {
    const dropAtMost = <T>(stream: Stream<T>, num: number): Stream<T> => {
        return stream.isNotEmpty() && num > 0 ? dropAtMost(stream.tail, num - 1) : stream
    }

    const dropWhile = <T>(stream: Stream<T>, p: Predicate<T>): Stream<T> => {
        return stream.isNotEmpty() && p(stream.head) ? dropWhile(stream.tail, p) : stream
    }

    const exists = <T>(stream: Stream<T>, p: Predicate<T>): boolean => {
        return stream.isNotEmpty() ? p(stream.head) || exists(stream.tail, p) : false
    }

    export const toList = <T>(stream: Stream<T>, list: List<T>): List<T> => {
        return stream.isNotEmpty() ? toList(stream.tail, list.cons(stream.head)) : list.reverse()
    }

    export class Cons<T> extends Stream<T> {
        readonly #head: Lazy<T>
        readonly #tail: Lazy<Stream<T>>

        constructor(head: Lazy<T>, tail: Lazy<Stream<T>>) {
            super()
            this.#head = head
            this.#tail = tail
        }

        get head(): T {
            return this.#head.value
        }

        get tail(): Stream<T> {
            return this.#tail.value
        }

        get isEmpty(): boolean {
            return false
        }

        dropAtMost(num: number): Stream<T> {
            return dropAtMost(this, num)
        }

        dropWhile(p: Predicate<T>): Stream<T> {
            return dropWhile(this, p)
        }

        exists(p: Predicate<T>): boolean {
            return exists(this, p)
        }

        takeAtMost(num: number): Stream<T> {
            return num > 0
                ? new Cons(
                      this.#head,
                      lazy(() => this.tail.takeAtMost(num - 1))
                  )
                : new Empty()
        }

        takeWhile(p: Predicate<T>): Stream<T> {
            return p(this.head)
                ? new Cons(
                      this.#head,
                      lazy(() => this.tail.takeWhile(p))
                  )
                : new Empty()
        }
    }

    export class Empty extends Stream<never> {
        get head(): null {
            return null
        }

        get tail(): null {
            return null
        }

        get isEmpty(): boolean {
            return true
        }

        dropAtMost(num: number): Stream<never> {
            return this
        }

        dropWhile(p: Predicate<never>): Stream<never> {
            return this
        }

        exists(p: Predicate<never>): boolean {
            return exists(this, p)
        }

        takeAtMost(num: number): Stream<never> {
            return this
        }

        takeWhile(p: Predicate<never>): Stream<never> {
            return this
        }
    }
}

export default Stream
