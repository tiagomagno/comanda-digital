const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const config = {
    apiUrl,
    // URL base do servidor (sem o sufixo /api), usada pela conexão Socket.IO
    socketUrl: apiUrl.replace(/\/api\/?$/, ''),
};
