import { assert } from 'chai'
import Option from '../option/Option'
import Pair, { pair } from '../pair/Pair'
import List, { flattenOption, product, sequence, unzip, zipWith } from './List'

describe('Тест класса List', () => {
    const charCode = (char: string): number => char.charCodeAt(0) - 'a'.charCodeAt(0)

    const EMPTY_LIST = List.new<string>()
    const CHAR_LIST = List.new('a', 'b', 'c')

    describe('Тест конструктора', () => {
        it('Пустой список', () => {
            assert.instanceOf(EMPTY_LIST, List)
        })
        it('Список элементов', () => {
            assert.instanceOf(CHAR_LIST, List)
        })
    })

    describe('Тест свойства head', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.head, undefined)
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.head, 'a')
        })
    })

    describe('Тест свойства tail', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.tail, undefined)
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.tail!.toString(), 'b, c')
        })
    })

    describe('Тест свойства isEmpty', () => {
        it('Пустой список', () => {
            assert.isTrue(EMPTY_LIST.isEmpty)
        })
        it('Список элементов', () => {
            assert.isFalse(CHAR_LIST.isEmpty)
        })
    })

    describe('Тест свойства size', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.size, 0)
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.size, 3)
        })
    })

    describe('Тест свойства доступа headSafe', () => {
        it('Пустой список', () => {
            assert.isTrue(EMPTY_LIST.headSafe.isEmpty)
        })
        it('Список элементов', () => {
            assert.equal(
                CHAR_LIST.headSafe.getOrElse(() => ''),
                'a'
            )
        })
    })

    describe('Тест свойства доступа lastSafe', () => {
        it('Пустой список', () => {
            assert.isTrue(EMPTY_LIST.lastSafe.isEmpty)
        })
        it('Список элементов', () => {
            assert.equal(
                CHAR_LIST.lastSafe.getOrElse(() => ''),
                'c'
            )
        })
    })

    describe('Тест метода isNotEmpty', () => {
        it('Пустой список', () => {
            assert.isFalse(EMPTY_LIST.isNotEmpty())
        })
        it('Список элементов', () => {
            assert.isTrue(CHAR_LIST.isNotEmpty())
        })
    })

    describe('Тест метода toString', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.toString(), '')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.toString(), 'a, b, c')
        })
    })

    describe('Тест метода concat', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.concat(List.new('a')).toString(), 'a')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.concat(List.new('d')).toString(), 'a, b, c, d')
        })
    })

    describe('Тест метода cons', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.cons('_').toString(), '_')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.cons('_').toString(), '_, a, b, c')
        })
    })

    describe('Тест метода drop', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.drop(5), EMPTY_LIST)
        })
        it('Список элементов, @param n < 0', () => {
            assert.equal(CHAR_LIST.drop(-1), CHAR_LIST)
        })
        it('Список элементов, @param n > 0 и n < list.size', () => {
            assert.equal(CHAR_LIST.drop(CHAR_LIST.size - 1).head, 'c')
        })
        it('Список элементов, @param n > 0 и n = list.size', () => {
            assert.equal(CHAR_LIST.drop(CHAR_LIST.size), EMPTY_LIST)
        })
        it('Список элементов, @param n > 0 и n > list.size', () => {
            assert.equal(CHAR_LIST.drop(CHAR_LIST.size + 1), EMPTY_LIST)
        })
    })

    describe('Тест метода dropWhile', () => {
        const isLowerCase: (s: string) => boolean = (s) => s === s.toLowerCase()

        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.dropWhile(isLowerCase), EMPTY_LIST)
        })
        it('Список элементов, @param func для каждого элемента вернет true', () => {
            assert.equal(CHAR_LIST.dropWhile(isLowerCase), EMPTY_LIST)
        })
        it('Список элементов, @param func для нескольких элементов вернет true', () => {
            assert.equal(CHAR_LIST.dropWhile((item) => item !== 'c').head, 'c')
        })
    })

    describe('Тест метода filter', () => {
        const p: Predicate<string> = (s) => s !== 'b'

        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.filter(p), EMPTY_LIST)
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.filter(p).toString(), 'a, c')
        })
    })

    describe('Тест метода flat', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.flat().toString(), '')
        })
        it('Список элементов', () => {
            assert.equal(
                List.new<any>(
                    List.new('a'),
                    List.new(List.new('b')),
                    List.new(List.new(List.new('c')))
                )
                    .flat()
                    .toString(),
                'a, b, c'
            )
        })
    })

    describe('Тест метода flatMap', () => {
        const func: (item: string) => List<string> = (item) =>
            List.new(item.toLowerCase(), item.toUpperCase())

        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.flatMap(func).toString(), '')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.flatMap(func).toString(), 'a, A, b, B, c, C')
        })
    })

    describe('Тест метода fold', () => {
        const func: (acc: string) => (item: string) => string = (acc) => (item) => `${acc}${item}`

        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.fold('', func), '')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.fold('', func), 'abc')
        })
    })

    describe('Тест метода foldRight', () => {
        const func: (acc: string) => (item: string) => string = (acc) => (item) => `${acc}${item}`

        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.foldRight('', func), '')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.foldRight('', func), 'cba')
        })
    })

    describe('Тест метода forEach', () => {
        let a = ''

        beforeEach(() => {
            a = ''
        })

        const func: (item: string) => void = (item) => {
            a += item
        }

        it('Пустой список', () => {
            EMPTY_LIST.forEach(func)
            assert.equal(a, '')
        })
        it('Список элементов', () => {
            CHAR_LIST.forEach(func)
            assert.equal(a, 'abc')
        })
    })

    describe('Тест метода getAt', () => {
        it('Результат: экземпляр класса Option', () => {
            assert.instanceOf(CHAR_LIST.getAt(1), Option)
        })
        it('Отрицательный индекс', () => {
            assert.isTrue(CHAR_LIST.getAt(-1).isEmpty)
        })
        it('Индекс 0', () => {
            assert.isTrue(
                CHAR_LIST.getAt(0)
                    .map((a) => a === 'a')
                    .getOrElse(() => false)
            )
        })
        it('Индекс элемента, расположенного между первым и последними элементами', () => {
            assert.isTrue(
                CHAR_LIST.getAt(1)
                    .map((b) => b === 'b')
                    .getOrElse(() => false)
            )
        })
        it('Последний индекс', () => {
            assert.isTrue(
                CHAR_LIST.getAt(2)
                    .map((c) => c === 'c')
                    .getOrElse(() => false)
            )
        })
        it('Индекс, равный размеру списка', () => {
            assert.isTrue(CHAR_LIST.getAt(CHAR_LIST.size).isEmpty)
        })
        it('Индекс, превышающий размер списка', () => {
            assert.isTrue(CHAR_LIST.getAt(CHAR_LIST.size + 1).isEmpty)
        })
    })

    describe('Тест метода getAtViaFoldViaZero', () => {
        it('Результат: экземпляр класса Option', () => {
            assert.instanceOf(CHAR_LIST.getAtViaFoldViaZero(1), Option)
        })
        it('Отрицательный индекс', () => {
            assert.isTrue(CHAR_LIST.getAtViaFoldViaZero(-1).isEmpty)
        })
        it('Индекс 0', () => {
            assert.isTrue(
                CHAR_LIST.getAtViaFoldViaZero(0)
                    .map((a) => a === 'a')
                    .getOrElse(() => false)
            )
        })
        it('Индекс элемента, расположенного между первым и последними элементами', () => {
            assert.isTrue(
                CHAR_LIST.getAtViaFoldViaZero(1)
                    .map((b) => b === 'b')
                    .getOrElse(() => false)
            )
        })
        it('Последний индекс', () => {
            assert.isTrue(
                CHAR_LIST.getAtViaFoldViaZero(2)
                    .map((c) => c === 'c')
                    .getOrElse(() => false)
            )
        })
        it('Индекс, равный размеру списка', () => {
            assert.isTrue(CHAR_LIST.getAtViaFoldViaZero(CHAR_LIST.size).isEmpty)
        })
        it('Индекс, превышающий размер списка', () => {
            assert.isTrue(CHAR_LIST.getAtViaFoldViaZero(CHAR_LIST.size + 1).isEmpty)
        })
    })

    describe('Тест метода init', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.init(), EMPTY_LIST)
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.init().toString(), 'a, b')
        })
    })

    describe('Тест метода map', () => {
        const func: (item: string) => string = (item) => item.toUpperCase()

        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.map(func).toString(), '')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.map(func).toString(), 'A, B, C')
        })
    })

    describe('Тест метода reverse', () => {
        it('Пустой список', () => {
            assert.equal(EMPTY_LIST.reverse().toString(), '')
        })
        it('Список элементов', () => {
            assert.equal(CHAR_LIST.reverse().toString(), 'c, b, a')
        })
    })

    describe('Тест метода unzip', () => {
        const f = (it: string): Pair<number, string> => pair(charCode(it), it)

        it('Результат: экземпляр класса Pair', () => {
            assert.instanceOf(CHAR_LIST.unzip(f), Pair)
        })
        it('Результат: пара пустых список', () => {
            assert.isTrue(
                EMPTY_LIST.unzip(f).map(([listA, listB]) => [listA.isEmpty === listB.isEmpty, null])
                    .first
            )
        })
        it('Результат: пара списков значений', () => {
            assert.equal(
                CHAR_LIST.unzip(f).map(([listA, listB]) => [
                    listA
                        .map((it) => it.toString())
                        .concat(listB)
                        .toString(),
                    null
                ]).first,
                '0, 1, 2, a, b, c'
            )
        })
    })

    describe('Тест утилиты flattenOption', () => {
        it('Результат: экземпляр класса List', () => {
            assert.instanceOf(flattenOption(List.new<Option<any>>()), List)
        })
        it('Результат: пустой список', () => {
            assert.isTrue(flattenOption(CHAR_LIST.map(() => Option.new())).isEmpty)
        })
        it('Результат: список не-nullable значений', () => {
            assert.equal(
                flattenOption(
                    CHAR_LIST.flatMap((it) => List.new(Option.new(), Option.new(it)))
                ).toString(),
                'a, b, c'
            )
        })
    })

    describe('Тест утилиты product', () => {
        const f = (a: string) => (b: string) => `${a}${b}`

        it('Результат: экземпляр класса List', () => {
            assert.instanceOf(product(CHAR_LIST, CHAR_LIST, f), List)
        })
        it('Результат: пустой список', () => {
            assert.isTrue(
                product(CHAR_LIST, EMPTY_LIST, f).concat(product(EMPTY_LIST, CHAR_LIST, f)).isEmpty
            )
        })
        it('Результат: список значений, представляющих комбинации значений обоих списков', () => {
            assert.equal(
                product(
                    CHAR_LIST,
                    CHAR_LIST.map((it) => it.toUpperCase()),
                    f
                ).toString(),
                'aA, aB, aC, bA, bB, bC, cA, cB, cC'
            )
        })
    })

    describe('Тест утилиты sequence', () => {
        it('Результат: экземпляр класса Option', () => {
            assert.instanceOf(sequence(List.new<Option<any>>()), Option)
        })
        it('Результат: необязательное значение с пустым списком', () => {
            assert.isTrue(sequence(CHAR_LIST.map(() => Option.new())).isEmpty)
        })
        it('Результат: необязательное значение со списком не-nullable значений', () => {
            assert.equal(
                sequence(CHAR_LIST.map((it) => Option.new(charCode(it))))
                    .getOrElse(() => List.new())
                    .toString(),
                '0, 1, 2'
            )
        })
    })

    describe('Тест утилиты unzip', () => {
        const PAIR_LIST = CHAR_LIST.map((it) => pair(charCode(it), it))

        it('Результат: экземпляр класса Pair', () => {
            assert.instanceOf(unzip(PAIR_LIST), Pair)
        })
        it('Результат: пара пустых список', () => {
            assert.isTrue(
                unzip(List.new<Pair<any, any>>()).map(([listA, listB]) => [listA === listB, null])
                    .first
            )
        })
        it('Результат: пара списков значений', () => {
            assert.equal(
                unzip(PAIR_LIST).map(([listA, listB]) => [
                    listA
                        .map((it) => it.toString())
                        .concat(listB)
                        .toString(),
                    null
                ]).first,
                '0, 1, 2, a, b, c'
            )
        })
    })

    describe('Тест утилиты zipWith', () => {
        const f =
            (a: number) =>
            (b: string): [number, string] =>
                [a, b]

        const CHAR_CODE_LIST = CHAR_LIST.map(charCode)

        it('Результат: экземпляр класса List', () => {
            assert.instanceOf(zipWith(CHAR_CODE_LIST, CHAR_LIST, f), List)
        })
        it('Результат: пустой список', () => {
            assert.isTrue(zipWith(List.new<number>(), CHAR_LIST, f).isEmpty)
        })
        it('Результат: список кортежей', () => {
            assert.equal(
                zipWith(CHAR_CODE_LIST, CHAR_LIST, f)
                    .map(([num, str]) => `${num}${str}`)
                    .toString(),
                '0a, 1b, 2c'
            )
        })
    })
})
