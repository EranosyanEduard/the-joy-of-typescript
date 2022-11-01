import { assert } from 'chai'
import { lazy } from '../lazy/Lazy'
import List from '../list/List'
import Stream from './Stream'

describe('Тест класса Stream', () => {
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

    const isLowerThan =
        (max: number) =>
        (n: number): boolean =>
            n < max

    describe('Тест конструктора Stream.empty', () => {
        const emptyStream = Stream.empty()

        it('Экземпляр класса Stream.Empty', () => {
            assert.instanceOf(emptyStream, Stream.Empty)
        })
        it('Свойство head - null', () => {
            assert.isNull(emptyStream.head)
        })
        it('Свойство tail - null', () => {
            assert.isNull(emptyStream.tail)
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
            assert.equal(numStream.head, 0)
        })
        it('Свойство tail - экземпляр класса Stream.Empty', () => {
            assert.instanceOf(numStream.tail, Stream.Empty)
        })
        it('Свойство isEmpty - false', () => {
            assert.isFalse(numStream.isEmpty)
        })
    })

    describe('Тест конструктора Stream.from', () => {
        const nums = Stream.from(0)

        it('Начальное значение - 0', () => {
            assert.equal(nums.head, 0)
        })
        it('2-е значение - 1', () => {
            assert.equal(nums.tail!.head, 1)
        })
        it('3-е значение - 2', () => {
            assert.equal(nums.tail!.tail!.head, 2)
        })
        it('4-е значение - 3', () => {
            assert.equal(nums.tail!.tail!.tail!.head, 3)
        })
    })

    describe('Тест конструктора Stream.iterate', () => {
        const chars = Stream.iterate('a', (head) => String.fromCharCode(head.charCodeAt(0) + 1))

        it('Начальное значение - "a"', () => {
            assert.equal(chars.head, 'a')
        })
        it('2-е значение - "b"', () => {
            assert.equal(chars.tail!.head, 'b')
        })
        it('3-е значение - "c"', () => {
            assert.equal(chars.tail!.tail!.head, 'c')
        })
        it('4-е значение - "d"', () => {
            assert.equal(chars.tail!.tail!.tail!.head, 'd')
        })
    })

    describe('Тест конструктора Stream.repeat', () => {
        const one = Stream.repeat(() => 0)

        it('Экземпляр класса Stream.Cons', () => {
            assert.instanceOf(one, Stream.Cons)
        })
        it('Начальное значение - 0', () => {
            assert.equal(one.head, 0)
        })
        it('2-е значение - 0', () => {
            assert.equal(one.tail!.head, 0)
        })
        it('3-е значение - 0', () => {
            assert.equal(one.tail!.tail!.head, 0)
        })
        it('4-е значение - 0', () => {
            assert.equal(one.tail!.tail!.tail!.head, 0)
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
})
