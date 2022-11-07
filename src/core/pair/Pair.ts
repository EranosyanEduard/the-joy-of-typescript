class Pair<A, B = A> {
    constructor(readonly first: A, readonly second: B) {}

    flatMap<C, D>(f: (pair: PairAsTuple<A, B>) => Pair<C, D>): Pair<C, D> {
        return f([this.first, this.second])
    }

    map<C, D>(f: (pair: PairAsTuple<A, B>) => PairAsTuple<C, D>): Pair<C, D> {
        return new Pair(...f([this.first, this.second]))
    }
}

const pair = <A, B>(first: A, second: B): Pair<A, B> => new Pair(first, second)

export default Pair
export { pair }
