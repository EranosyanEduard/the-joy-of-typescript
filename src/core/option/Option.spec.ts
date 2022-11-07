import { assert } from 'chai'
import Option, { map2 } from './Option'

describe('Тест класса Option', () => {
    const nan: Factory<typeof NaN> = () => NaN

    describe('Тест конструктора new', () => {
        describe('Аргумент конструктора не nullable', () => {
            const zero = Option.new(0)

            it('Экземпляр класса Option.Some', () => {
                assert.instanceOf(zero, Option.Some)
            })
            it('Свойство isEmpty - false', () => {
                assert.isFalse(zero.isEmpty)
            })
        })

        describe('Аргумент конструктора nullable', () => {
            const [NULL, UNDEF, NONE] = [Option.new(null), Option.new(undefined), Option.new()]

            it('Экземпляр класса Option.Empty - синглтон', () => {
                // @ts-expect-error
                assert.isTrue(NULL === UNDEF && UNDEF === NONE)
            })
            it('Свойство isEmpty - true', () => {
                assert.isTrue(Option.new().isEmpty)
            })
        })
    })

    describe('Тест метода getOrElse', () => {
        it('Значение отсутствует', () => {
            assert.isNaN(Option.new<number>().getOrElse(nan))
        })
        it('Значение присутствует', () => {
            assert.equal(Option.new<number>(0).getOrElse(nan), 0)
        })
    })

    describe('Тест метода isNotEmpty', () => {
        it('Значение отсутствует', () => {
            assert.isFalse(Option.new<number>().isNotEmpty())
        })
        it('Значение присутствует', () => {
            assert.isTrue(Option.new<number>(0).isNotEmpty())
        })
    })

    describe('Тест метода map', () => {
        const add = (n: number): number => n + 1

        it('Значение отсутствует', () => {
            assert.isNaN(Option.new<number>().map(add).getOrElse(nan))
        })
        it('Значение присутствует', () => {
            assert.equal(Option.new<number>(0).map(add).getOrElse(nan), 1)
        })
    })

    describe('Тест метода flatMap', () => {
        const add = (n: number): Option<number> => Option.new(n + 1)

        it('Значение отсутствует', () => {
            assert.isNaN(Option.new<number>().flatMap(add).getOrElse(nan))
        })
        it('Значение присутствует', () => {
            assert.equal(Option.new<number>(0).flatMap(add).getOrElse(nan), 1)
        })
    })

    describe('Тест метода filter', () => {
        const isZero: Predicate<number> = (n) => n === 0

        it('Значение отсутствует', () => {
            assert.isNaN(Option.new<number>().filter(isZero).getOrElse(nan))
        })
        it('Значение присутствует - оригинальный экземпляр', () => {
            const zeroA = Option.new<number>(0)
            const zeroB = zeroA.filter(isZero)

            assert.equal(zeroA, zeroB)
        })
        it('Значение присутствует - 0', () => {
            assert.equal(Option.new<number>(0).filter(isZero).getOrElse(nan), 0)
        })
    })

    describe('Тест метода orElse', () => {
        const minusOne: Factory<Option<-1>> = () => Option.new(-1)

        it('Значение отсутствует', () => {
            assert.equal(Option.new<number>().orElse(minusOne).getOrElse(nan), -1)
        })
        it('Значение присутствует', () => {
            assert.equal(Option.new<number>(0).orElse(minusOne).getOrElse(nan), 0)
        })
    })

    describe('Тест утилиты map2', () => {
        const opt = map2(Option.new(0), Option.new('a'), (n) => (s) => [n, s])

        it('Результат: экземпляр класса Option', () => {
            assert.instanceOf(opt, Option)
        })
        it('Результат: кортеж [0, "a"]', () => {
            assert.isTrue(opt.map(([n, s]) => n === 0 && s === 'a').getOrElse(() => false))
        })
    })
})
