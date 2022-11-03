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
     * Создать бесконечный поток чисел Фибоначчи.
     */
    static fibs(): Stream<number> {
        return Stream.unfold<number, Pair<number>>([1, 1], ([p, n]) => [p, [n, p + n]])
    }

    /**
     * Создать бесконечный поток элементов типа **number**.
     * @param start - Начальное значение.
     */
    static from(start: number): Stream<number> {
        return Stream.unfold(start, (n) => [n, n + 1])
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

    /**
     * Создать бесконечный поток элементов типа **T**.
     * @see Методы: Stream.fibs, Stream.from.
     * @param seed - Начальное значение.
     * @param f - Фабрика значений.
     */
    static unfold<T, U>(seed: U, f: (seed: U) => Nullable<Pair<T, U>>): Stream<T> {
        const pair = f(seed)
        return pair === null || pair === undefined
            ? Stream.empty()
            : Stream.cons(
                  lazy(() => pair[0]),
                  lazy(() => Stream.unfold(pair[1], f))
              )
    }

    /**
     * Добавить поток элементов **stream** в конец текущего потока.
     * @param stream - Поток элементов.
     */
    append(stream: Stream<T>): Stream<T> {
        return this.foldRight(
            lazy(() => stream),
            (head) => (acc) =>
                Stream.cons(
                    lazy(() => head),
                    acc
                )
        )
    }

    filter(p: Predicate<T>): Stream<T> {
        return this.foldRight(
            lazy(() => Stream.empty()),
            (head) => (acc) =>
                p(head)
                    ? Stream.cons(
                          lazy(() => head),
                          acc
                      )
                    : acc.value
        )
    }

    find(p: Predicate<T>): Nullable<T> {
        return this.filter(p).head
    }

    flatMap<U>(f: (head: T) => Stream<U>): Stream<U> {
        return this.foldRight(
            lazy(() => Stream.empty()),
            (head) => (acc) => f(head).append(acc.value)
        )
    }

    isNotEmpty(): this is Stream.Cons<T> {
        return !this.isEmpty
    }

    /**
     * Взять из потока первые n-элементов, для которых предикат **p** вернул
     * значение true.
     * @param p - Функция-предикат.
     */
    takeWhileViaFoldRight(p: Predicate<T>): Stream<T> {
        return this.foldRight(
            lazy(() => Stream.empty()),
            (head) => (acc) =>
                p(head)
                    ? Stream.cons(
                          lazy(() => head),
                          acc
                      )
                    : Stream.empty()
        )
    }

    map<U>(f: (head: T) => U): Stream<U> {
        return this.foldRight(
            lazy(() => Stream.empty()),
            (head) => (acc) =>
                Stream.cons(
                    lazy(() => f(head)),
                    acc
                )
        )
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
     * Свернуть поток "справа".
     * @param identity - Начальное значение.
     * @param f - Функция для "объединения" текущего значения **головы** и
     * **аккумулятора**.
     */
    abstract foldRight<U>(identity: Lazy<U>, f: (head: T) => (acc: Lazy<U>) => U): U

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

    const foldRight = <T, U>(
        stream: Stream<T>,
        acc: Lazy<U>,
        f: (head: T) => (acc: Lazy<U>) => U
    ): U => {
        return stream.isNotEmpty()
            ? f(stream.head)(lazy(() => foldRight(stream.tail, acc, f)))
            : acc.value
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

        foldRight<U>(identity: Lazy<U>, f: (head: T) => (acc: Lazy<U>) => U): U {
            return foldRight(this, identity, f)
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

        foldRight<U>(identity: Lazy<U>, f: (head: never) => (acc: Lazy<U>) => U): U {
            return identity.value
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
