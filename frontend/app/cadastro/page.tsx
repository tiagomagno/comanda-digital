'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CadastroRapidoPage() {
    const router = useRouter();
    const [nomefantasia, setNomefantasia] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [operaLocal, setOperaLocal] = useState(false);
    const [operaHospedado, setOperaHospedado] = useState(false);
    const [operaDelivery, setOperaDelivery] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nomefantasia.trim() || !email.trim() || !senha.trim()) {
            toast.error('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        if (!operaLocal && !operaHospedado && !operaDelivery) {
            toast.error('Selecione pelo menos um canal de consumo');
            return;
        }

        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        try {
            const payload = {
                estabelecimento: {
                    nome: nomefantasia,
                    email: email,
                    operaLocal,
                    operaHospedado,
                    operaDelivery
                },
                gestor: {
                    nome: nomefantasia, // simplificando
                    email: email,
                    senha: senha
                }
            };

            const response = await fetch(`${baseUrl}/api/auth/onboarding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const errMsg = typeof data.error === 'string'
                    ? data.error
                    : data.error?.message || data.message || 'Erro ao criar conta.';
                throw new Error(errMsg);
            }

            const data = await response.json();
            // Salva o token para manter o usuário logado
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            toast.success('Conta criada com sucesso!');
            setIsSuccess(true);
        } catch (error: any) {
            const rawMsg = error?.message || 'Erro ao realizar cadastro';
            if (rawMsg.includes('fetch') || error?.name === 'TypeError') {
                toast.error('Não foi possível conectar ao servidor.');
            } else {
                toast.error(rawMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] h-screen overflow-hidden flex flex-row font-sans">

            {/* ── Painel esquerdo: conteúdo dinâmico (Formulário ou Sucesso) ── */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white flex flex-col relative z-10">
                {/* Logo */}
                <div className="px-8 pt-8 lg:px-16 xl:px-24">
                    <div className="flex items-center gap-2 text-[#0B241E]">
                        <div className="w-8 h-8 bg-[#FF5C01] rounded-lg flex items-center justify-center text-white shadow-sm">
                            <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                        </div>
                        <span className="font-bold text-xl tracking-wide font-display">Comanda Digital</span>
                    </div>
                </div>

                {isSuccess ? (
                    <>
                        {/* Conteúdo de Sucesso Livre */}
                        <div className="flex-grow flex flex-col justify-center px-8 lg:px-16 xl:px-24">
                            <div className="max-w-md mx-auto w-full text-center">
                                <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                    <div className="w-12 h-12 bg-[#00A859] rounded-full flex items-center justify-center text-white shadow-sm">
                                        <span className="material-symbols-outlined text-3xl">check</span>
                                    </div>
                                </div>

                                <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">
                                    Tudo pronto!
                                </h1>
                                <h2 className="text-xl font-semibold text-gray-600 mb-6">
                                    Sua conta foi criada com sucesso
                                </h2>

                                <p className="text-gray-500 font-light text-base leading-relaxed mb-10">
                                    Bem-vindo ao Comanda Digital. Agora você já pode começar a configurar seu estabelecimento e revolucionar sua operação.
                                </p>

                                <div className="bg-[#fcfaf9] border border-gray-100 rounded-xl p-8 mb-6">
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <span className="material-symbols-outlined text-[#FF5C01] text-sm">rocket_launch</span>
                                        <span className="text-xs font-bold text-[#FF5C01] uppercase tracking-wider">
                                            Próximos Passos
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => router.push('/boas-vindas')}
                                        className="w-full flex items-center justify-center gap-2 bg-[#FF5C01] hover:bg-[#e05101] text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-orange-500/30 transition-all duration-200"
                                    >
                                        Acessar meu Painel
                                        <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
                                    </button>
                                </div>

                                <div className="flex bg-[#f0f7ff] text-[#1e40af] text-sm p-4 rounded-lg items-start text-left gap-3">
                                    <span className="material-symbols-outlined text-[#3b82f6]">mark_email_unread</span>
                                    <span className="leading-relaxed font-light">
                                        Enviamos um e-mail com o <strong className="font-semibold text-[#1e3a8a]">link de acesso exclusivo</strong> do seu estabelecimento para que você não o perca.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Formulário */}
                        <div className="flex-grow flex flex-col justify-center px-8 py-8 lg:px-16 xl:px-24">
                            <div className="mb-8 max-w-md mx-auto w-full">
                                <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
                                    Comece agora
                                </h1>
                                <p className="text-gray-500 text-lg font-light">
                                    Crie sua conta e revolucione o seu negócio.
                                </p>
                            </div>

                            <form
                                className="flex flex-col max-w-md mx-auto w-full space-y-5"
                                onSubmit={handleSubmit}
                            >
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="nome">
                                        Nome do Estabelecimento
                                    </label>
                                    <input
                                        id="nome"
                                        type="text"
                                        required
                                        value={nomefantasia}
                                        onChange={(e) => setNomefantasia(e.target.value)}
                                        placeholder="Restaurante da Maria..."
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none"
                                    />
                                </div>

                                {/* E-mail */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                                        E-mail
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="exemplo@email.com"
                                        disabled={isLoading}
                                        autoComplete="email"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none"
                                    />
                                </div>

                                {/* Senha */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={senha}
                                            onChange={(e) => setSenha(e.target.value)}
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                            autoComplete="new-password"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01] focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none pr-11"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword
                                                ? <EyeOff className="h-5 w-5" />
                                                : <Eye className="h-5 w-5" />
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Como os clientes consomem? - Full width */}
                                <div className="pt-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Como seus clientes consomem? <span className="text-gray-400 font-normal text-xs ml-1">(Marque 1 ou mais)</span>
                                    </label>
                                    <div className="flex flex-col gap-3">
                                        {/* Local */}
                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${operaLocal ? 'bg-[#fff8f3] border-[#FF5C01]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex h-5 items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={operaLocal}
                                                    onChange={(e) => setOperaLocal(e.target.checked)}
                                                    className="w-4 h-4 rounded text-[#FF5C01] focus:ring-[#FF5C01] border-gray-300"
                                                />
                                            </div>
                                            <div className="-mt-1">
                                                <span className="text-sm font-semibold text-gray-900">No local (Mesas / Comandas)</span>
                                                <p className="text-xs text-gray-500 mt-0.5">Atendimento presencial focado em mesas e salão.</p>
                                            </div>
                                        </label>

                                        {/* Hospedado */}
                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${operaHospedado ? 'bg-[#fff8f3] border-[#FF5C01]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex h-5 items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={operaHospedado}
                                                    onChange={(e) => setOperaHospedado(e.target.checked)}
                                                    className="w-4 h-4 rounded text-[#FF5C01] focus:ring-[#FF5C01] border-gray-300"
                                                />
                                            </div>
                                            <div className="-mt-1">
                                                <span className="text-sm font-semibold text-gray-900">Em quartos ou unidades</span>
                                                <p className="text-xs text-gray-500 mt-0.5">Para hotéis, pousadas, hospitais ou camarotes privados.</p>
                                            </div>
                                        </label>

                                        {/* Delivery */}
                                        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${operaDelivery ? 'bg-[#fff8f3] border-[#FF5C01]' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex h-5 items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={operaDelivery}
                                                    onChange={(e) => setOperaDelivery(e.target.checked)}
                                                    className="w-4 h-4 rounded text-[#FF5C01] focus:ring-[#FF5C01] border-gray-300"
                                                />
                                            </div>
                                            <div className="-mt-1">
                                                <span className="text-sm font-semibold text-gray-900">Delivery ou retirada</span>
                                                <p className="text-xs text-gray-500 mt-0.5">Operações de entrega remota ou retirada de balcão.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Link
                                        href="/"
                                        className="flex items-center justify-center border-2 border-gray-200 text-gray-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Voltar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center justify-center gap-2 bg-[#FF5C01] hover:bg-[#e05101] text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-orange-500/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading
                                            ? <Loader2 className="animate-spin h-5 w-5" />
                                            : 'Avançar'
                                        }
                                    </button>
                                </div>

                                {/* Links adicionais */}
                                <div className="text-center pt-2">
                                    <Link
                                        href="/auth/login"
                                        className="block text-gray-500 hover:text-gray-700 text-sm transition-colors"
                                    >
                                        Já possui cadastro?{' '}
                                        <span className="text-[#FF5C01] font-semibold hover:underline">
                                            Entrar
                                        </span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* ── Painel direito: cor sólida ── */}
            <div className="hidden lg:flex lg:w-1/2 h-full bg-[#0B241E] flex-col items-center justify-center gap-8 relative overflow-hidden">

                {/* Círculos decorativos */}
                <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-[#14423b] opacity-60" />
                <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-[#14423b] opacity-40" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-white/5" />

                {/* Card central */}
                <div className="relative z-10 flex flex-col items-center gap-6 text-center px-12">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#FF5C01]/20"></div>
                        <span className="material-symbols-outlined text-[#FF5C01] text-4xl relative z-10">storefront</span>
                    </div>
                    <div>
                        <span className="block font-bold text-4xl tracking-wide font-display text-white">
                            Junte-se à Revolução
                        </span>
                        <span className="block text-white/60 text-base font-light tracking-wider mt-2">
                            Transforme as operações do seu estabelecimento.
                        </span>
                    </div>

                    {/* Mini features */}
                    <div className="mt-4 flex flex-col gap-3 w-full max-w-sm text-left">
                        {[
                            { icon: 'speed', text: 'Cadastro rápido em menos de 1 minuto' },
                            { icon: 'devices', text: 'Acesse o painel em qualquer dispositivo' },
                            { icon: 'support_agent', text: 'Configuração completa nativa no dashboard' },
                        ].map(({ icon, text }) => (
                            <div key={icon} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[#FF5C01] text-lg">{icon}</span>
                                </div>
                                <span className="text-white/70 text-sm font-light">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}
