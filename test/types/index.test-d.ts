import { expectAssignable, expectNotAssignable } from 'tsd'
import { MercuriusExplainOptions } from '../../index'
const emptyCacheOptions = {}
expectAssignable<MercuriusExplainOptions>(emptyCacheOptions)
