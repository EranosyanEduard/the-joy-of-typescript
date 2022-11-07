import { singleton } from 'src/utils/decorators'
import Option, { map2 } from '../option/Option'
import Pair, { pair } from '../pair/Pair'

abstract class List<T> {
    static new<T>(...args: readonly T[]): List<T> {
        return args.reduceRight((acc, item) => acc.cons(item), List.Nil.instance() as List<T>)
    }

    get headSafe(): Option<T> {
        return Option.new(this.head)
    }

    get lastSafe(): Option<T> {
        return Option.new(this.reverse().head)
    }

    /**
     * Создать список с новой "головой" (**head**).
     * @param head - Голова списка.
     */
    cons(head: T): List<T> {
        return new List.Cons(head, this)
    }

    concat(list: List<T>): List<T> {
        return this.foldRight(list, (l) => (item) => l.cons(item))
    }

    drop(n: number): List<T> {
        return List.#drop(
            this,
            n,
            (n) => n > 0,
            (n) => n - 1
        )
    }

    dropWhile(p: Predicate<T>): List<T> {
        return List.#drop(
            this,
            this as List<T>,
            (list) => p(list.head!),
            (list) => list.tail!
        )
    }

    filter(p: Predicate<T>): List<T> {
        return this.foldRight(
            List.Nil.instance() as List<T>,
            (list) => (item) => p(item) ? list.cons(item) : list
        )
    }

    flat<U>(): List<U> {
        return this.fold(List.Nil.instance() as List<U>, (list) => (item) => {
            const LIST = item instanceof List ? item.flat() : List.new(item)
            return list.concat(LIST as List<U>)
        })
    }

    flatMap<U>(func: (item: T) => List<U>): List<U> {
        return this.fold(
            List.Nil.instance() as List<U>,
            (list) => (item) => list.concat(func(item))
        )
    }

    fold<U>(identity: U, func: (acc: U) => (item: T) => U): U {
        return List.#fold(identity, this, func)
    }

    foldRight<U>(identity: U, func: (acc: U) => (item: T) => U): U {
        return this.reverse().fold(identity, func)
    }

    forEach(func: (item: T) => void): void {
        this.fold(undefined, () => func)
    }

    /**
     * Удалить последний элемент списка.
     */
    init(): List<T> {
        return this.reverse().drop(1).reverse()
    }

    isNotEmpty(): this is List.Cons<T> {
        return !this.isEmpty
    }

    map<U>(func: (item: T) => U): List<U> {
        return this.foldRight(
            List.Nil.instance() as List<U>,
            (acc) => (item) => acc.cons(func(item))
        )
    }

    reverse(): List<T> {
        return this.fold(List.Nil.instance() as List<T>, (list) => (item) => list.cons(item))
    }

    abstract readonly head: T | undefined
    abstract readonly tail: List<T> | undefined
    abstract readonly isEmpty: boolean
    abstract readonly size: number
    abstract toString(): string

    static #drop<T, V>(list: List<T>, v: V, p: Predicate<V>, next: (v: V) => V): List<T> {
        if (list.isNotEmpty() && p(v)) {
            return List.#drop(list.tail, next(v), p, next)
        }
        return list
    }

    static #fold<T, U>(acc: U, list: List<T>, func: (acc: U) => (item: T) => U): U {
        if (list.isNotEmpty()) {
            return List.#fold(func(acc)(list.head), list.tail, func)
        }
        return acc
    }
}

namespace List {
    export class Cons<T> extends List<T> {
        readonly isEmpty: boolean
        readonly size: number

        constructor(readonly head: T, readonly tail: List<T>) {
            super()
            this.isEmpty = false
            this.size = 1 + tail.size
        }

        toString(): string {
            return this.fold('', (acc) => (item) => `${acc}${acc.length > 0 ? ', ' : ''}${item}`)
        }
    }

    @singleton
    export class Nil extends List<never> {
        static instance: () => Nil

        readonly head: undefined
        readonly tail: undefined
        readonly isEmpty: boolean
        readonly size: number

        constructor() {
            super()
            this.head = undefined
            this.tail = undefined
            this.isEmpty = true
            this.size = 0
        }

        toString(): string {
            return ''
        }
    }
}

const flattenOption = <T>(list: List<Option<T>>): List<T> => {
    return list.flatMap((it) => it.map((v) => List.new(v)).getOrElse(() => List.new()))
}

const product = <A, B, C>(listA: List<A>, listB: List<B>, f: (a: A) => (b: B) => C): List<C> => {
    return listA.flatMap((a) => listB.map(f(a)))
}

const sequence = <T>(list: List<Option<T>>): Option<List<T>> => {
    return traverse(list, (it) => it)
}

const traverse = <T, U>(list: List<T>, f: (item: T) => Option<U>): Option<List<U>> => {
    return list.foldRight(
        Option.new(List.new()),
        (acc) => (it) => map2(f(it), acc, (item) => (l) => l.cons(item))
    )
}

const unzip = <T, U>(list: List<Pair<T, U>>): Pair<List<T>, List<U>> => {
    return list.foldRight(
        pair(List.new(), List.new()),
        (acc) => (it) =>
            acc.flatMap(([listA, listB]) => it.map(([a, b]) => [listA.cons(a), listB.cons(b)]))
    )
}

const zipWith2 = <A, B, C>(
    listA: List<A>,
    listB: List<B>,
    listC: List<C>,
    f: (a: A) => (b: B) => C
): List<C> => {
    return listA.isNotEmpty() && listB.isNotEmpty()
        ? zipWith2(listA.tail, listB.tail, listC.cons(f(listA.head)(listB.head)), f)
        : listC.reverse()
}

const zipWith = <A, B, C>(listA: List<A>, listB: List<B>, f: (a: A) => (b: B) => C): List<C> => {
    return zipWith2(listA, listB, List.new(), f)
}

export default List
export { flattenOption, product, sequence, traverse, unzip, zipWith }
