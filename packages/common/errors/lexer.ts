import { error } from '../utils/error'

export const AbstractToken = error('AbstractToken', 'Abstract token can\'t be used')
export const UnexpectedToken = error('UnexpectedToken', 'Unexpected token')
export const AnonymousToken = error('AnonymousToken', 'Anonymous tokens are not allowed')
