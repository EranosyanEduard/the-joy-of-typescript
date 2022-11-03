import { assert } from 'chai'
import Lazy, { lazy } from '../lazy/Lazy'
import List from '../list/List'
import Option from '../option/Option'
import Stream from './Stream'

describe('Тест класса Stream', () => {
    const falseFactory: Factory<false> = () => false

    /**
     * Создать последовательность элементов типа **number**.
     * @example
     * const nums = range(10, 0);
     * console.log(nums); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
     *
     * @param length - Количество элементов.
     * @param start - Начальный элемент.
     */
    const range = (length: number, start = 0): number[] => {
        return Array.from({ length }, (_, idx) => idx + start)
    }

    const isEven: Predicate<number> = (n) => n % 2 === 0

    const isLowerThan =
        (max: number) =>
        (n: number): boolean =>
            n < max

    describe('Тест конструктора Stream.empty', () => {
        const emptyStream = Stream.empty()

        it('Экземпляр класса Stream.Empty - синглтон', () => {
            assert.equal(emptyStream, Stream.empty())
        })
        it('Свойство head - экземпляр Option.None', () => {
            assert.equal(emptyStream.head, Option.new())
        })
        it('Свойство tail - экземпляр Option.None', () => {
            assert.equal(emptyStream.tail, Option.new())
        })
        it('Свойство isEmpty - true', () => {
            assert.isTrue(emptyStream.isEmpty)
        })
    })

    describe('Тест конструктора Stream.cons', () => {
        const numStream = Stream.cons(
            lazy(() => 0),
            lazy(() => Stream.empty())
        )

        it('Экземпляр класса Stream.Cons', () => {
            assert.instanceOf(numStream, Stream.Cons)
        })
        it('Свойство head - 0', () => {
            assert.isTrue(numStream.head.map((h) => h === 0).getOrElse(falseFactory))
        })
        it('Свойство tail - экземпляр класса Stream.Empty', () => {
            assert.isTrue(numStream.tail.map((s) => s === Stream.empty()).getOrElse(falseFactory))
        })
        it('Свойство isEmpty - false', () => {
            assert.isFalse(numStream.isEmpty)
        })
    })

    describe('Тест конструктора Stream.fibs', () => {
        it('Последовательность 10 чисел Фибоначчи', () => {
            assert.equal(
                Stream.fibs().takeAtMost(10).toList().toString(),
                List.new(1, 1, 2, 3, 5, 8, 13, 21, 34, 55).toString()
            )
        })
    })

    describe('Тест конструктора Stream.from', () => {
        const nums = Stream.from(0)

        it('Начальное значение - 0', () => {
            assert.isTrue(nums.head.map((h) => h === 0).getOrElse(falseFactory))
        })
        it('2-е значение - 1', () => {
            assert.isTrue(
                nums.tail.flatMap((s) => s.head.map((h) => h === 1)).getOrElse(falseFactory)
            )
        })
        it('3-е значение - 2', () => {
            assert.isTrue(
                nums.tail
                    .flatMap((t1) => t1.tail.flatMap((t2) => t2.head.map((h) => h === 2)))
                    .getOrElse(falseFactory)
            )
        })
        it('4-е значение - 3', () => {
            assert.isTrue(
                nums.tail
                    .flatMap((t1) =>
                        t1.tail.flatMap((t2) =>
                            t2.tail.flatMap((t3) => t3.head.map((h) => h === 3))
                        )
                    )
                    .getOrElse(falseFactory)
            )
        })
    })

    describe('Тест конструктора Stream.iterate', () => {
        const chars = Stream.iterate('a', (head) => String.fromCharCode(head.charCodeAt(0) + 1))

        it('Начальное значение - "a"', () => {
            assert.isTrue(chars.head.map((a) => a === 'a').getOrElse(falseFactory))
        })
        it('2-е значение - "b"', () => {
            assert.isTrue(
                chars.tail.flatMap((t1) => t1.head.map((b) => b === 'b')).getOrElse(falseFactory)
            )
        })
        it('3-е значение - "c"', () => {
            assert.isTrue(
                chars.tail
                    .flatMap((t1) => t1.tail.flatMap((t2) => t2.head.map((c) => c === 'c')))
                    .getOrElse(falseFactory)
            )
        })
        it('4-е значение - "d"', () => {
            assert.isTrue(
                chars.tail
                    .flatMap((t1) =>
                        t1.tail.flatMap((t2) =>
                            t2.tail.flatMap((t3) => t3.head.map((d) => d === 'd'))
                        )
                    )
                    .getOrElse(falseFactory)
            )
        })
    })

    describe('Тест конструктора Stream.repeat', () => {
        const one = Stream.repeat(() => 0)

        it('Экземпляр класса Stream.Cons', () => {
            assert.instanceOf(one, Stream.Cons)
        })
        it('Начальное значение - 0', () => {
            assert.isTrue(one.head.map((h) => h === 0).getOrElse(falseFactory))
        })
        it('2-е значение - 0', () => {
            assert.isTrue(
                one.tail.flatMap((s) => s.head.map((h) => h === 0)).getOrElse(falseFactory)
            )
        })
        it('3-е значение - 0', () => {
            assert.isTrue(
                one.tail
                    .flatMap((t1) => t1.tail.flatMap((t2) => t2.head.map((h) => h === 0)))
                    .getOrElse(falseFactory)
            )
        })
        it('4-е значение - 0', () => {
            assert.isTrue(
                one.tail
                    .flatMap((t1) =>
                        t1.tail.flatMap((t2) =>
                            t2.tail.flatMap((t3) => t3.head.map((h) => h === 0))
                        )
                    )
                    .getOrElse(falseFactory)
            )
        })
    })

    describe('Тест метода toList', () => {
        it('Экземпляр - пустой поток', () => {
            assert.equal(Stream.empty().toList().size, 0)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.cons(
                    lazy(() => 0),
                    lazy(() =>
                        Stream.cons(
                            lazy(() => 1),
                            lazy(() =>
                                Stream.cons(
                                    lazy(() => 2),
                                    lazy(() => Stream.empty())
                                )
                            )
                        )
                    )
                )
                    .toList()
                    .toString(),
                List.new(0, 1, 2).toString()
            )
        })
    })

    describe('Тест метода takeAtMost', () => {
        it('Экземпляр - пустой поток', () => {
            const emptyStream = Stream.empty()
            assert.equal(emptyStream.takeAtMost(1000), emptyStream)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeAtMost(1000).toList().toString(),
                List.new(...range(1000)).toString()
            )
        })
    })

    describe('Тест метода takeWhile', () => {
        it('Экземпляр - пустой поток', () => {
            const emptyStream = Stream.empty<number>()
            assert.equal(emptyStream.takeWhile(isLowerThan(1000)), emptyStream)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeWhile(isLowerThan(1000)).toList().toString(),
                List.new(...range(1000)).toString()
            )
        })
    })

    describe('Тест метода dropAtMost', () => {
        it('Экземпляр - пустой поток', () => {
            const emptyStream = Stream.empty()
            assert.equal(emptyStream.dropAtMost(1000), emptyStream)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeAtMost(1000).dropAtMost(500).toList().toString(),
                List.new(...range(500, 500)).toString()
            )
        })
    })

    describe('Тест метода dropWhile', () => {
        it('Экземпляр - пустой поток', () => {
            const emptyStream = Stream.empty<number>()
            assert.equal(emptyStream.dropWhile(isLowerThan(1000)), emptyStream)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0)
                    .dropWhile(isLowerThan(1000))
                    .takeWhile(isLowerThan(2000))
                    .toList()
                    .toString(),
                List.new(...range(1000, 1000)).toString()
            )
        })
    })

    describe('Тест метода - exist', () => {
        it('Экземпляр - пустой поток', () => {
            assert.isFalse(Stream.empty<number>().exists(isLowerThan(1000)))
        })
        it('Экземпляр - поток элементов', () => {
            assert.isTrue(
                Stream.from(0)
                    .dropAtMost(1000)
                    .takeAtMost(1000)
                    .exists((n) => n === 1500)
            )
        })
    })

    describe('Тест метода - foldRight', () => {
        const f = (head: string) => (acc: Lazy<string>) => `${acc.value}${head}`

        it('Экземпляр - пустой поток', () => {
            assert.equal(
                Stream.empty<string>().foldRight(
                    lazy(() => ''),
                    f
                ),
                ''
            )
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.iterate('a', (head) => String.fromCharCode(head.charCodeAt(0) + 1))
                    .takeAtMost(10)
                    .foldRight(
                        lazy(() => ''),
                        f
                    ),
                'abcdefghij'.split('').reverse().join('')
            )
        })
    })

    describe('Тест метода - append', () => {
        const nums = Stream.from(0).takeAtMost(1000)

        it('Экземпляр - пустой поток', () => {
            assert.equal(Stream.empty<number>().append(nums), nums)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                nums.append(Stream.from(1000).takeAtMost(1000)).toList().toString(),
                List.new(...range(2000)).toString()
            )
        })
    })

    describe('Тест метода filter', () => {
        it('Экземпляр - пустой поток', () => {
            assert.isTrue(Stream.empty<number>().filter(isEven).isEmpty)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeAtMost(1000).filter(isEven).toList().toString(),
                List.new(...range(1000))
                    .filter(isEven)
                    .toString()
            )
        })
    })

    describe('Тест метода find', () => {
        const nan: Factory<typeof NaN> = () => NaN

        it('Экземпляр - пустой поток', () => {
            assert.isNaN(Stream.empty<number>().find(isEven).getOrElse(nan))
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(-500)
                    .takeAtMost(1000)
                    .find((n) => isEven(n) && n > 0)
                    .getOrElse(nan),
                2
            )
        })
    })

    describe('Тест метода flatMap', () => {
        const toStream = (head: number): Stream<number> => Stream.from(head * 10).takeAtMost(10)

        it('Экземпляр - пустой поток', () => {
            assert.isTrue(Stream.empty<number>().flatMap(toStream).isEmpty)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeAtMost(10).flatMap(toStream).toList().toString(),
                List.new(...range(100)).toString()
            )
        })
    })

    describe('Тест метода map', () => {
        const toStr = (head: number): string => head.toString()

        it('Экземпляр - пустой поток', () => {
            assert.isTrue(Stream.empty<number>().map(toStr).isEmpty)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeAtMost(1000).map(toStr).toList().toString(),
                List.new(...range(1000))
                    .map(toStr)
                    .toString()
            )
        })
    })

    describe('Тест метода takeWhileViaFoldRight', () => {
        it('Экземпляр - пустой поток', () => {
            assert.isTrue(Stream.empty<number>().takeWhileViaFoldRight(isLowerThan(1000)).isEmpty)
        })
        it('Экземпляр - поток элементов', () => {
            assert.equal(
                Stream.from(0).takeWhileViaFoldRight(isLowerThan(1000)).toList().toString(),
                List.new(...range(1000)).toString()
            )
        })
    })

    describe('Обход потока выполняется 1 раз', () => {
        const funNames: Array<'filter' | 'map'> = []
        const stream = Stream.from(0)
            .takeAtMost(5)
            .map((n) => {
                funNames.push('map')
                return n ** 2
            })
            .filter((n) => {
                funNames.push('filter')
                return isEven(n)
            })

        it('Элементы потока', () => {
            assert.equal(stream.toList().toString(), List.new(0, 4, 16).toString())
        })
        it('Порядок вызова методов: map -> filter -> map -> filter -> и т.д.', () => {
            assert.equal(
                funNames.join(),
                range(5)
                    .flatMap<typeof funNames[number]>(() => ['map', 'filter'])
                    .join()
            )
        })
    })
})
