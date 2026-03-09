import Link from 'next/link';
import { ChefHat, Construction, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 text-center">
            {/* Blobs decorativos */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center gap-6 max-w-lg">
                {/* Badge */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold uppercase tracking-wide">
                    <Construction className="h-3.5 w-3.5" />
                    Landing Page — Em Construção
                </div>

                {/* Logo / Ícone */}
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <ChefHat className="h-10 w-10 text-indigo-400" />
                </div>

                {/* Título */}
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">
                        Comanda Digital
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">
                        A solução completa para gestão de pedidos do seu restaurante ou bar.
                    </p>
                </div>

                {/* Placeholder da landing */}
                <div className="w-full border border-dashed border-white/20 rounded-2xl px-8 py-10 bg-white/5 backdrop-blur-sm">
                    <p className="text-slate-500 text-sm italic">
                        ✦ Conteúdo da landing page será desenvolvido aqui ✦
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <Link
                        href="/cadastro"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
                    >
                        Cadastre-se <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/auth/login"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold rounded-xl transition-all"
                    >
                        Entrar
                    </Link>
                </div>
            </div>
        </div>
    );
}
