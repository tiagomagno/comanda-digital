import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
    '/',
    '/auth/login',
    '/cadastro',           // Self-onboarding de novos estabelecimentos
    '/operacao/login',     // Login da equipe operacional (garçom, bar, cozinha)
    '/acesso', // Links: cardápio e painel + credenciais
    '/cliente', // Cliente: QR Code, cardápio, comanda, pedidos
    '/comanda', // Comanda nova / por código (fluxo cliente)
    '/cardapio',
    '/pedido',
    '/carrinho',
    '/mesa',
];

// Mapeamento de rotas para roles
const roleRoutes: Record<string, string[]> = {
    '/admin': ['GESTOR'],
    '/gestor': ['GESTOR'],
    '/garcom': ['GARCOM', 'GESTOR'],
    '/cozinha': ['COZINHA', 'GESTOR'],
    '/bar': ['COZINHA', 'GESTOR'], // Bar usa mesma role de Cozinha por enquanto
    '/caixa': ['CAIXA', 'GESTOR'],
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Se a rota for pública, permite
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Se não tiver token e tentar acessar rota protegida, redireciona para login
    if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // A validação de role no middleware é complexa sem decodificar o token jwt (que precisa de lib externa no edge)
    // Por enquanto, vamos deixar a validação de role para o AuthContext/Layout no client-side
    // ou apenas checar a existência do token no middleware.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - manifest.json
         */
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
    ],
};
