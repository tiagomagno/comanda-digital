import { httpServer } from './app.js';
import { logger } from './utils/logger.js';

// Iniciar servidor
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT as number, '0.0.0.0', () => {
    logger.info('🚀 Servidor iniciado', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        url: `http://0.0.0.0:${PORT}`,
    });
    console.log(`\n✅ Servidor rodando: http://0.0.0.0:${PORT} (bind Docker 0.0.0.0)`);
});
