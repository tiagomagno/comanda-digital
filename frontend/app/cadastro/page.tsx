'use client';

import { useState, useEffect, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function CadastroContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const leadToken = searchParams.get('leadToken');

    const [nomefantasia, setNomefantasia] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [operaLocal, setOperaLocal] = useState(false);
    const [operaHospedado, setOperaHospedado] = useState(false);
    const [operaDelivery, setOperaDelivery] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFetchingLead, setIsFetchingLead] = useState(false);

    // Auto-preenchimento via Lead Token
    useEffect(() => {
        if (leadToken) {
            const fetchLead = async () => {
                setIsFetchingLead(true);
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
                    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
                    const res = await fetch(`${baseUrl}/api/auth/pre-cadastro/${leadToken}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.lead) {
                            if (data.lead.nomeEstabelecimento) setNomefantasia(data.lead.nomeEstabelecimento);
                            if (data.lead.email) setEmail(data.lead.email);
                        }
                    }
                } catch (e) {
                    console.error('Erro ao buscar lead:', e);
                } finally {
                    setIsFetchingLead(false);
                }
            };
            fetchLead();
        }
    }, [leadToken]);

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

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
        const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

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
                    nome: nomefantasia,
                    email: email,
                    senha: senha
                },
                leadToken: leadToken || undefined
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

    if (isSuccess) {
        return (
            <main className="min-h-screen flex flex-col bg-surface-dim font-sans">
                <div className="flex-grow flex items-center justify-center p-6">
                    <div className="w-full max-w-lg text-center">
                        {/* Success Icon */}
                        <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-secondary-container/30 flex items-center justify-center relative">
                            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
                                <span className="material-symbols-outlined text-secondary text-4xl" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                            </div>
                            <div className="absolute inset-0 rounded-full border border-secondary-container/30 animate-ping opacity-30"></div>
                        </div>

                        <h1 className="text-4xl font-display font-extrabold text-white tracking-tight mb-3">
                            Tudo pronto!
                        </h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
                            Bem-vindo ao Comanda Digital. Agora você já pode começar a configurar seu estabelecimento e revolucionar sua operação.
                        </p>

                        <div className="glass-card rounded-2xl p-8 mb-6 text-left">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary-container text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>rocket_launch</span>
                                <span className="text-xs font-label font-bold text-primary-container uppercase tracking-widest">Próximos Passos</span>
                            </div>
                            <button
                                onClick={() => router.push('/boas-vindas')}
                                className="w-full bg-primary-container hover:bg-inverse-primary text-on-primary-container font-bold py-4 rounded-xl signature-glow hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Acessar meu Painel
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>

                        <div className="flex items-start gap-3 text-left glass-card rounded-xl p-4">
                            <span className="material-symbols-outlined text-tertiary mt-0.5" style={{"fontVariationSettings":"'FILL' 1"}}>mark_email_unread</span>
                            <span className="text-on-surface-variant text-sm leading-relaxed">
                                Enviamos um e-mail com o <strong className="text-on-surface font-semibold">link de acesso exclusivo</strong> do seu estabelecimento para que você não o perca.
                            </span>
                        </div>
                    </div>
                </div>

                <footer className="bg-surface-container-lowest border-t border-white/5 py-8 w-full">
                    <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] font-label uppercase tracking-widest text-neutral-500">
                            © 2024 Comanda Digital. Culinary Kineticism.
                        </p>
                        <div className="flex gap-8">
                            <a className="text-[10px] font-label uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors" href="#">Suporte</a>
                            <a className="text-[10px] font-label uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors" href="#">Segurança</a>
                        </div>
                    </div>
                </footer>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col md:flex-row font-sans">
            {/* Left Side: Form Section */}
            <section className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 bg-surface-dim relative overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/10 rounded-full blur-[100px]"></div>

                <div className="relative z-10 max-w-md w-full mx-auto">
                    {/* Branding Anchor */}
                    <div className="mb-10 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary-container text-4xl" style={{"fontVariationSettings":"'FILL' 1"}}>restaurant</span>
                        <span className="text-xl font-display font-bold tracking-tight text-white">Comanda Digital</span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-on-surface mb-3 leading-tight">
                            Falta pouco para revolucionar sua operação!
                        </h1>
                        <p className="text-on-surface-variant leading-relaxed">
                            Complete os detalhes finais para ativar sua conta e começar a otimizar o atendimento do seu estabelecimento hoje mesmo.
                        </p>
                        {isFetchingLead && (
                            <p className="text-primary-container text-sm mt-3 animate-pulse flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Mapeando seus dados...
                            </p>
                        )}
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Pre-filled Identity Group (Visual Validation) */}
                        {(nomefantasia || email) && leadToken && (
                            <div className="flex gap-4">
                                {nomefantasia && (
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2 px-1">Estabelecimento</label>
                                        <div className="glass-input rounded-xl px-4 py-3 text-on-surface opacity-60 flex items-center justify-between">
                                            <span className="truncate text-sm">{nomefantasia}</span>
                                            <span className="material-symbols-outlined text-secondary text-sm flex-shrink-0 ml-2" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                                        </div>
                                    </div>
                                )}
                                {email && (
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2 px-1">E-mail</label>
                                        <div className="glass-input rounded-xl px-4 py-3 text-on-surface opacity-60 flex items-center justify-between overflow-hidden">
                                            <span className="truncate text-sm">{email}</span>
                                            <span className="material-symbols-outlined text-secondary text-sm flex-shrink-0 ml-2" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Establishment Details */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2 px-1" htmlFor="establishment">Nome do Estabelecimento</label>
                                <input
                                    className="w-full glass-input bg-surface-container-lowest focus:bg-surface-container-high border-outline-variant/15 focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                                    id="establishment"
                                    placeholder="Ex: Bistrô do Porto"
                                    type="text"
                                    required
                                    value={nomefantasia}
                                    onChange={(e) => setNomefantasia(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2 px-1" htmlFor="email">E-mail Profissional</label>
                                <input
                                    className="w-full glass-input bg-surface-container-lowest focus:bg-surface-container-high border-outline-variant/15 focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                                    id="email"
                                    placeholder="nome@restaurante.com"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Security */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2 px-1" htmlFor="password">Definir Senha</label>
                                <div className="relative">
                                    <input
                                        className="w-full glass-input bg-surface-container-lowest focus:bg-surface-container-high border-outline-variant/15 focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none pr-11"
                                        id="password"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={senha}
                                        onChange={(e) => setSenha(e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        tabIndex={-1}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2 px-1" htmlFor="confirm_password">Confirmar Senha</label>
                                <input
                                    className="w-full glass-input bg-surface-container-lowest focus:bg-surface-container-high border-outline-variant/15 focus:border-primary-container focus:ring-1 focus:ring-primary-container rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 transition-all outline-none"
                                    id="confirm_password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Canais de Consumo */}
                        <div>
                            <label className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-3 px-1">
                                Como seus clientes consomem? <span className="text-on-surface-variant/50">(marque 1 ou mais)</span>
                            </label>
                            <div className="flex flex-col gap-2">
                                {/* Local */}
                                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${operaLocal ? 'bg-primary-container/10 border-primary-container/40' : 'glass-input border-outline-variant/15 hover:border-outline-variant/30'}`}>
                                    <div className="flex h-5 items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={operaLocal}
                                            onChange={(e) => setOperaLocal(e.target.checked)}
                                            className="w-4 h-4 rounded text-primary-container focus:ring-primary-container border-outline-variant"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-on-surface">No local (Mesas / Comandas)</span>
                                        <p className="text-xs text-on-surface-variant mt-0.5">Atendimento presencial focado em mesas e salão.</p>
                                    </div>
                                </label>

                                {/* Hospedado */}
                                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${operaHospedado ? 'bg-primary-container/10 border-primary-container/40' : 'glass-input border-outline-variant/15 hover:border-outline-variant/30'}`}>
                                    <div className="flex h-5 items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={operaHospedado}
                                            onChange={(e) => setOperaHospedado(e.target.checked)}
                                            className="w-4 h-4 rounded text-primary-container focus:ring-primary-container border-outline-variant"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-on-surface">Em quartos ou unidades</span>
                                        <p className="text-xs text-on-surface-variant mt-0.5">Para hotéis, pousadas, hospitais ou camarotes privados.</p>
                                    </div>
                                </label>

                                {/* Delivery */}
                                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${operaDelivery ? 'bg-primary-container/10 border-primary-container/40' : 'glass-input border-outline-variant/15 hover:border-outline-variant/30'}`}>
                                    <div className="flex h-5 items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={operaDelivery}
                                            onChange={(e) => setOperaDelivery(e.target.checked)}
                                            className="w-4 h-4 rounded text-primary-container focus:ring-primary-container border-outline-variant"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-on-surface">Delivery ou retirada</span>
                                        <p className="text-xs text-on-surface-variant mt-0.5">Operações de entrega remota ou retirada de balcão.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                className="w-full bg-primary-container hover:bg-inverse-primary text-on-primary-container font-bold py-4 rounded-xl signature-glow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? <Loader2 className="animate-spin w-5 h-5" />
                                    : <>
                                        Acessar Plataforma
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </>
                                }
                            </button>
                        </div>

                        <p className="text-center text-xs text-on-surface-variant/60 pt-2 leading-relaxed">
                            Ao clicar em acessar, você concorda com nossos{' '}
                            <Link className="text-primary hover:underline" href="#">Termos de Serviço</Link>{' '}
                            e{' '}
                            <Link className="text-primary hover:underline" href="#">Política de Privacidade</Link>.
                        </p>

                        <div className="text-center">
                            <Link href="/auth/login" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                                Já possui conta?{' '}
                                <span className="text-primary-container font-semibold hover:underline">Entrar</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </section>

            {/* Right Side: Testimonial & Visual */}
            <section className="hidden md:flex md:w-1/2 relative bg-surface-container-lowest items-end justify-start overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        alt="Premium Restaurant Interior"
                        className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUgjpnKW-1jG7P5bV8qFncKvy4hG93Bht0R0qZTZwf15Z8S16p6UQsneKMfn9IOumLuZBDF1b8gvwMZBEiQR5fcTQr4x1gHuDyGm1fthsQwgrPyZG8uN6Ve-hp5BLM4cl2OPHomN7fTNxTzs06NK01fy-mJDlpQIyVI2xdtJN_mOz6L5246WIL-UyzJ6GDddzzxLiDSe-dQVdHYvrtXsJCoh8N52bACaSsHRSlbXJwgwGOaOZxO6KCWJ5gfXWcpQ4wRkUHHE5a5FQH"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent opacity-40"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 p-16 w-full max-w-2xl">
                    {/* Live Order Chip */}
                    <div className="inline-flex items-center gap-3 bg-secondary-container/80 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-outline-variant/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
                        </span>
                        <span className="text-xs font-label uppercase tracking-widest text-secondary font-bold">1.240 Restaurantes Ativos</span>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-4xl lg:text-5xl font-display font-extrabold tracking-tighter text-white leading-[1.1]">
                            &ldquo;Mudou completamente o ritmo da nossa cozinha.&rdquo;
                        </h2>
                        <div className="flex items-center gap-6 py-8">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-container/30 flex-shrink-0">
                                <img
                                    alt="Chef Profile"
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDw6wW0dXkynof8BKIU8EC8Wdrpz7hS0Ei0u7_FBdePCJUKImNXVCWhZYw7Ztjlkw07EkcNKDzIDjy3agvWLxJu6A9vZzRqazSBFMCU-eX6mB7hbbGHrL4jtoifQf2R5PEQNs6hhBrCa-Zlljk4LcjYHubA084l_xP6cvB2KsjrU94yAZBEiugaIKKTPBZ9Q5r5TESlZHkqsLU0dbVLdUFKPT1dmGHu_EbXYMuidxVAgOxB4jcdzINBw_x-BUdcgKJi-jxj2vZKkd"
                                />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg font-display">Marco Aurélio</p>
                                <p className="text-on-surface-variant text-sm">Proprietário, Restaurante L&apos;Avenue</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div>
                                <p className="text-primary-container font-black text-3xl font-display">-35%</p>
                                <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1 font-label">Tempo de Espera</p>
                            </div>
                            <div>
                                <p className="text-primary-container font-black text-3xl font-display">+22%</p>
                                <p className="text-on-surface-variant text-xs uppercase tracking-widest mt-1 font-label">Ticket Médio</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Geometric Texture */}
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <span className="material-symbols-outlined text-[200px] text-white" style={{"fontVariationSettings":"'wght' 100"}}>grid_view</span>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="absolute bottom-0 left-0 right-0 bg-transparent py-6 w-full z-20">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-label uppercase tracking-widest text-neutral-500">
                        © 2024 Comanda Digital. Culinary Kineticism.
                    </p>
                    <div className="flex gap-8">
                        <a className="text-[10px] font-label uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors" href="#">Suporte</a>
                        <a className="text-[10px] font-label uppercase tracking-widest text-neutral-500 hover:text-primary transition-colors" href="#">Segurança</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}

export default function CadastroRapidoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-surface-dim">
                <Loader2 className="h-8 w-8 text-primary-container animate-spin" />
            </div>
        }>
            <CadastroContent />
        </Suspense>
    );
}
