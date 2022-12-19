import { expectAssignable } from 'tsd'
import { MercuriusExplainOptions } from '../../index'
const mercuriusExplainOptions = {
  enabled: true,
  gateway: true
}
expectAssignable<MercuriusExplainOptions>(mercuriusExplainOptions)
