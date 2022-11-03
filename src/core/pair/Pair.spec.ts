import { assert } from 'chai'
import Pair, { pair } from './Pair'

describe('Тест класса Pair', () => {
    describe('Тест конструктора', () => {
        const foo = new Pair(0, 'foo')

        it('Экземпляр класса Pair', () => {
            assert.instanceOf(foo, Pair)
        })
        it('Свойство first - 0', () => {
            assert.equal(foo.first, 0)
        })
        it('Свойство second - "foo"', () => {
            assert.equal(foo.second, 'foo')
        })
    })

    describe('Тест метода map', () => {
        const fooA = new Pair(0, 'foo')
        const fooB = fooA.map(([first, second]) => [first + 1, second.toUpperCase()])

        it('Новый экземпляр класса Pair', () => {
            assert.notEqual(fooA, fooB)
        })
        it('Свойство first - 1', () => {
            assert.equal(fooB.first, 1)
        })
        it('Свойство second - "FOO"', () => {
            assert.equal(fooB.second, 'FOO')
        })
    })

    describe('Тест функции-фабрики', () => {
        const foo = pair(0, 'foo')

        it('Экземпляр класса Pair', () => {
            assert.instanceOf(foo, Pair)
        })
        it('Свойство first - 0', () => {
            assert.equal(foo.first, 0)
        })
        it('Свойство second - "foo"', () => {
            assert.equal(foo.second, 'foo')
        })
    })
})
