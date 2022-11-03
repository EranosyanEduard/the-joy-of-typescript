import { assert } from 'chai'
import Lazy, { lazy } from './Lazy'

describe('Тест класса Lazy', () => {
    const doNothing = (arg: any): void => {}

    it('Тест конструктора', () => {
        assert.instanceOf(new Lazy(() => ''), Lazy)
    })
    it('Тест функции-фабрики', () => {
        assert.instanceOf(
            lazy(() => ''),
            Lazy
        )
    })

    describe('Значение', () => {
        let num: number, lazy: Lazy<typeof num>

        beforeEach(() => {
            num = 0
            lazy = new Lazy(() => ++num)
        })

        it('Значение не вычисляется при вызове конструктора', () => {
            assert.equal(num, 0)
        })
        it('Значение вычисляется при вызове метода value', () => {
            doNothing(lazy.value)
            assert.equal(num, 1)
        })
        it('Значение вычисляется при вызове метода value однажды', () => {
            doNothing(lazy.value)
            doNothing(lazy.value)
            assert.equal(num, 1)
        })
        it('Метод value возвращает актуальное значение', () => {
            doNothing(lazy.value)
            assert.equal(lazy.value, 1)
        })
    })
    describe('Тест метода flatMap', () => {
        let a: number, b: string, lazyA: Lazy<typeof a>, lazyB: Lazy<typeof b>

        beforeEach(() => {
            a = 0
            b = ''
            lazyA = new Lazy(() => ++a)
            lazyB = lazyA.flatMap((num) => new Lazy(() => (b = num.toString())))
        })

        it('Метод flatMap возвращает новый экземпляр класса Lazy', () => {
            assert.notEqual<Lazy<any>>(lazyA, lazyB)
        })
        it('Значение экземпляра lazyA не вычисляется при вызове метода flatMap', () => {
            assert.equal(a, 0)
        })
        it('Значение экземпляра lazyB не вычисляется при вызове метода flatMap', () => {
            assert.equal(b, '')
        })
        it('Значение экземпляра lazyB вычисляется на основе ф-ии, переданной на вход методу flatMap', () => {
            assert.equal(lazyB.value, '1')
        })
    })
    describe('Тест метода map', () => {
        let a: number, b: string, lazyA: Lazy<typeof a>, lazyB: Lazy<typeof b>

        beforeEach(() => {
            a = 0
            b = ''
            lazyA = new Lazy(() => ++a)
            lazyB = lazyA.map((num) => (b = num.toString()))
        })

        it('Метод map возвращает новый экземпляр класса Lazy', () => {
            assert.notEqual<Lazy<any>>(lazyA, lazyB)
        })
        it('Значение экземпляра lazyA не вычисляется при вызове метода map', () => {
            assert.equal(a, 0)
        })
        it('Значение экземпляра lazyB не вычисляется при вызове метода map', () => {
            assert.equal(b, '')
        })
        it('Значение экземпляра lazyB вычисляется на основе ф-ии, переданной на вход методу map', () => {
            assert.equal(lazyB.value, '1')
        })
    })
})
