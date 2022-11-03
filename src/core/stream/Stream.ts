import { singleton } from 'src/utils/decorators'
import Lazy, { lazy } from '../lazy/Lazy'
import List from '../list/List'
import Option from '../option/Option'
import Pair, { pair } from '../pair/Pair'

abstract class Stream<T> {
    static cons<T>(head: Lazy<T>, tail: Lazy<Stream<T>>): Stream<T> {
        return new Stream.Cons(head, tail)
    }

    static empty<T>(): Stream<T> {
        return Stream.Empty.instance()
    }

    /**
     * Создать бесконечный поток чисел Фибоначчи.
     */
    static fibs(): Stream<number> {
        return Stream.unfold<number, Pair<number>>(pair(1, 1), (p) =>
            p.map(([first, second]) => [first, pair(second, first + second)])
        )
    }

    /**
     * Создать бесконечный поток элементов типа **number**.
     * @param start - Начальное значение.
     */
    static from(start: number): Stream<number> {
        return Stream.unfold(start, (n) => pair(n, n + 1))
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
        return (
            f(seed)?.map(([first, second]) => [
                Stream.cons(
                    lazy(() => first),
                    lazy(() => Stream.unfold(second, f))
                ),
                null
            ]).first ?? Stream.empty()
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

    find(p: Predicate<T>): Option<T> {
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

    abstract get head(): Option<T>
    abstract get tail(): Option<Stream<T>>
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

    abstract toList(): List<T>
}

namespace Stream {
    export class Cons<T> extends Stream<T> {
        readonly #head: Lazy<T>
        readonly #tail: Lazy<Stream<T>>

        constructor(head: Lazy<T>, tail: Lazy<Stream<T>>) {
            super()
            this.#head = head
            this.#tail = tail
        }

        get head(): Option<T> {
            return Option.new(this.#head.value)
        }

        get tail(): Option<Stream<T>> {
            return Option.new(this.#tail.value)
        }

        get isEmpty(): boolean {
            return false
        }

        dropAtMost(num: number): Stream<T> {
            return Cons.#dropAtMost(this, num)
        }

        dropWhile(p: Predicate<T>): Stream<T> {
            return Cons.#dropWhile(this, p)
        }

        exists(p: Predicate<T>): boolean {
            return Cons.#exists(this, p)
        }

        foldRight<U>(identity: Lazy<U>, f: (head: T) => (acc: Lazy<U>) => U): U {
            return Cons.#foldRight(this, identity, f)
        }

        takeAtMost(num: number): Stream<T> {
            return num > 0
                ? new Cons(
                      this.#head,
                      lazy(() => this.#tail.value.takeAtMost(num - 1))
                  )
                : Empty.instance()
        }

        takeWhile(p: Predicate<T>): Stream<T> {
            return p(this.#head.value)
                ? new Cons(
                      this.#head,
                      lazy(() => this.#tail.value.takeWhile(p))
                  )
                : Empty.instance()
        }

        toList(): List<T> {
            return Cons.#toList(this)
        }

        static #dropAtMost<T>(stream: Stream<T>, num: number): Stream<T> {
            return stream.isNotEmpty() && num > 0
                ? Cons.#dropAtMost(stream.#tail.value, num - 1)
                : stream
        }

        static #dropWhile<T>(stream: Stream<T>, p: Predicate<T>): Stream<T> {
            return stream.isNotEmpty() && p(stream.#head.value)
                ? Cons.#dropWhile(stream.#tail.value, p)
                : stream
        }

        static #exists<T>(stream: Stream<T>, p: Predicate<T>): boolean {
            return stream.isNotEmpty()
                ? p(stream.#head.value) || Cons.#exists(stream.#tail.value, p)
                : false
        }

        static #foldRight<T, U>(
            stream: Stream<T>,
            acc: Lazy<U>,
            f: (head: T) => (acc: Lazy<U>) => U
        ): U {
            return stream.isNotEmpty()
                ? f(stream.#head.value)(lazy(() => Cons.#foldRight(stream.#tail.value, acc, f)))
                : acc.value
        }

        static #toList<T>(stream: Stream<T>, list: List<T> = List.new()): List<T> {
            return stream.isNotEmpty()
                ? Cons.#toList(stream.#tail.value, list.cons(stream.#head.value))
                : list.reverse()
        }
    }

    @singleton
    export class Empty extends Stream<never> {
        static instance: () => Empty

        get head(): Option<never> {
            return Option.new()
        }

        get tail(): Option<never> {
            return Option.new()
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
            return false
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

        toList(): List<never> {
            return List.new()
        }
    }
}

export default Stream
