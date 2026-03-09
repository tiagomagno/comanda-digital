import 'dotenv/config'
import { app } from './app'

const PORT = Number(process.env.PORT) || 3001

const start = async () => {
    try {
        await app.ready()
        await app.listen({ port: PORT, host: '0.0.0.0' })
        console.log(`Server listening on http://localhost:${PORT}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}
start()
