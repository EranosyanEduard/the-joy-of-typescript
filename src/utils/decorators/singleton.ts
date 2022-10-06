import { ConstructorMixin } from './models'

/**
 * Добавить в класс **Target** функционал класса-синглтона, т.е. класса,
 * имеющего единственный экземпляр.
 * @param Target - Декорируемый класс.
 */
function singleton<T extends ConstructorMixin>(Target: T): T {
    let instance: {}
    let useInstanceInterface = false

    return class Mixin extends Target {
        constructor(...args: any[]) {
            super(...args)

            if (!useInstanceInterface) {
                throw new Error(`Невозможно создать экземпляр класса ${Target.name}`)
            }

            Object.defineProperty(Mixin, 'name', { value: Target.name })
        }

        static instance(...args: ConstructorParameters<T>): {} {
            useInstanceInterface = true
            instance ??= new Target(...args)
            useInstanceInterface = false
            return instance
        }
    }
}

export default singleton
