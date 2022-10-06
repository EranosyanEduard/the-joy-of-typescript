import { assert } from 'chai'
import List from './List'

describe('Тест класса List', () => {
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
})
