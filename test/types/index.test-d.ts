import { expectAssignable } from 'tsd'
import { MercuriusExplainOptions } from '../../index'
const mercuriusExplainOptions = {
  enabled: true
}
expectAssignable<MercuriusExplainOptions>(mercuriusExplainOptions)
