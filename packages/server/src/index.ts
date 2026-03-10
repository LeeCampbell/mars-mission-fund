import pino from 'pino'
import { pool } from './db/pool.js'
import { createApp } from './app.js'

const logger = pino({ name: 'server' })
const PORT = process.env.PORT ?? '3001'

const app = createApp(pool)

app.listen(Number(PORT), () => {
  logger.info({ port: PORT }, 'Server listening')
})
