import { Router } from '@stricjs/router'
import { group } from '.'

export default new Router()
    .plug(group(import.meta.dir, {
        extensions: ['.lockb'],
        select: 'extensions'
    }))
