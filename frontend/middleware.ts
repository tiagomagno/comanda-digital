import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // Determinar se estamos acessando um subdomínio de "app." (Painel admin)
    const isAppSubdomain =
        hostname.startsWith('app.') ||
        // Regex opcional para testes locais como app.localhost:3000
        /^app\.(localhost|[\w.-]+)(:\d+)?$/.test(hostname);

    // Se o usuário acessar a URL base / de um subdomínio app...
    if (isAppSubdomain && url.pathname === '/') {
        // Reescrever invisivelmente para /auth/login ou /admin conforme necessário
        // Vamos mandá-lo para a tela de login inicial do sistema
        return NextResponse.rewrite(new URL('/auth/login', req.url));
    }

    // Aqui você pode expandir para interceptar todas as rotas (ex: se digitar app.site.com/dashboard joga pra /admin/dashboard)
    // Por ora deixaremos Next lidar com o resto do painel livremente.

    return NextResponse.next();
}

export const config = {
    // Ignorar rotas de API do next, imagens e arquivos estáticos (otimização)
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
