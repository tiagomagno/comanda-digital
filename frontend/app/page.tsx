'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// URL do Backend para consumo direto
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export default function LandingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nomeEstabelecimento: '',
        nomeGestor: '',
        email: '',
    });

    const handlePreCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/pre-cadastro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (data.token) {
                router.push(`/cadastro?leadToken=${data.token}`);
            } else {
                alert(data.error || 'Erro ao iniciar cadastro. Verifique os dados e tente novamente.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão. O servidor pode estar indisponível.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen font-sans selection:bg-primary-container selection:text-white">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
                    <div className="text-xl font-bold text-white flex items-center gap-2 font-['Plus_Jakarta_Sans'] tracking-tight">
                        <span className="material-symbols-outlined text-primary-container" data-icon="restaurant" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                        <span className="font-black uppercase tracking-tighter">Comanda Digital</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-neutral-400 hover:text-white transition-colors font-semibold" href="#funcionalidades">Funcionalidades</a>
                        <a className="text-neutral-400 hover:text-white transition-colors" href="#beneficios">Benefícios</a>
                        <a className="text-neutral-400 hover:text-white transition-colors" href="#planos">Planos</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hidden md:block text-white px-5 py-2 hover:bg-white/5 rounded-xl transition-all active:scale-95" onClick={() => router.push('/auth/login')}>Entrar</button>
                    </div>
                </div>
            </nav>
            <main className="pt-32">
                {/* Section 1: Hero */}
                <section className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center py-20">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-primary-container">A Revolução Gastronômica</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-6 text-on-surface">
                            O futuro do seu restaurante na <span className="text-primary-container orange-text-glow">palma da mão</span> do seu cliente.
                        </h1>
                        <p className="text-on-surface-variant text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
                            Elimine erros de pedidos, reduza custos operacionais e aumente seu ticket médio com o sistema BYOD e KDS mais avançado do mercado.
                        </p>
                        
                        {/* Lead Capture Form */}
                        <form onSubmit={handlePreCadastro} className="glass-card p-4 rounded-2xl flex flex-col gap-3 max-w-xl">
                            <input 
                                className="flex-1 bg-surface-container-lowest border border-white/5 focus:border-transparent focus:ring-2 focus:ring-primary-container text-white rounded-xl px-4 py-3.5 placeholder:text-neutral-600 outline-none text-sm" 
                                placeholder="Nome do seu negócio" 
                                type="text" 
                                required
                                value={formData.nomeEstabelecimento}
                                onChange={e => setFormData({...formData, nomeEstabelecimento: e.target.value})}
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input 
                                    className="flex-1 bg-surface-container-lowest border border-white/5 focus:border-transparent focus:ring-2 focus:ring-primary-container text-white rounded-xl px-4 py-3.5 placeholder:text-neutral-600 outline-none text-sm" 
                                    placeholder="Seu Nome" 
                                    type="text" 
                                    required
                                    value={formData.nomeGestor}
                                    onChange={e => setFormData({...formData, nomeGestor: e.target.value})}
                                />
                                <input 
                                    className="flex-1 bg-surface-container-lowest border border-white/5 focus:border-transparent focus:ring-2 focus:ring-primary-container text-white rounded-xl px-4 py-3.5 placeholder:text-neutral-600 outline-none text-sm" 
                                    placeholder="E-mail profissional" 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary-container text-on-primary-fixed font-bold px-6 py-4 rounded-xl signature-glow whitespace-nowrap transition-all hover:scale-[1.02] active:scale-95 text-base flex justify-center items-center"
                            >
                                {loading && <span className="material-symbols-outlined animate-spin mr-2">refresh</span>}
                                {loading ? 'Aguarde...' : 'Testar Grátis - 7 Dias'}
                            </button>
                        </form>

                        <p className="mt-4 text-xs text-neutral-500 px-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[14px]" data-icon="verified_user">verified_user</span>
                            Sem cartão de crédito. Teste por 7 dias grátis.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-container/20 blur-[120px] rounded-full"></div>
                        <div className="relative glass-card rounded-[2.5rem] p-4 shadow-2xl border border-white/10">
                            <img className="w-full rounded-[1.5rem] aspect-[4/5] object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkcKsIy6IjayNWaRSU86-IqQjZGQlaq_2iwVsam66cCQ2m9PD8LwiknRmaf5sOFcte38EbdM0Xi6-Lr1YTMeKLYOp6SHUggqaQnDg9pKKDsL7U4Jrv3oNaAEovV1EJ6Kn40LkiYoayOjdeMr6UrcGkoFCe6KakIYR-llzRpxPJSLcPYX0TR9tIZGBOOyjR6sWkSNN7c8ItYl5vehQ3KXoZ72EsU36tutnkPFMUU6YUjSAe7ZunO9ipwl4xud7u8O0DPayiJrSa-URS" alt="Comanda Digital KDS" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent rounded-[1.5rem]" />
                            <div className="absolute bottom-8 left-8 right-8 glass-card p-5 rounded-2xl flex items-center gap-4 border-white/20">
                                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-white" data-icon="shopping_cart" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-container">Novo Pedido Realizado</p>
                                    <p className="text-sm text-white font-bold">Mesa 04 — 2x Burger Premium</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="px-2 py-1 bg-primary-container/20 border border-primary-container/30 rounded text-[10px] text-primary-container font-black">LIVE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Social Proof/Metrics */}
                <section className="max-w-7xl mx-auto px-6 py-32" id="beneficios">
                    <div className="text-center mb-20">
                        <h2 className="text-xs uppercase tracking-[0.4em] text-primary-container font-black mb-4">Resultados que Importam</h2>
                        <h3 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6">Eficiência que se traduz em <span className="text-primary-container italic">lucro</span>.</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-10 rounded-3xl text-center border-b-4 border-primary-container transition-transform hover:-translate-y-2">
                            <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mx-auto mb-8 border border-primary-container/20">
                                <span className="material-symbols-outlined text-primary-container text-4xl">speed</span>
                            </div>
                            <h4 className="text-3xl font-black text-white mb-4">+35% Giro de Mesa</h4>
                            <p className="text-on-surface-variant leading-relaxed">Otimize a rotatividade sem apressar o cliente. Pedidos e pagamentos instantâneos reduzem o tempo ocioso.</p>
                        </div>
                        <div className="glass-card p-10 rounded-3xl text-center border-b-4 border-primary-container transition-transform hover:-translate-y-2">
                            <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mx-auto mb-8 border border-primary-container/20">
                                <span className="material-symbols-outlined text-primary-container text-4xl">group_remove</span>
                            </div>
                            <h4 className="text-3xl font-black text-white mb-4">-15% Custos Op.</h4>
                            <p className="text-on-surface-variant leading-relaxed">Sua equipe foca na hospitalidade enquanto a tecnologia cuida da anotação de pedidos e fechamento.</p>
                        </div>
                        <div className="glass-card p-10 rounded-3xl text-center border-b-4 border-primary-container transition-transform hover:-translate-y-2">
                            <div className="w-20 h-20 rounded-full bg-primary-container/10 flex items-center justify-center mx-auto mb-8 border border-primary-container/20">
                                <span className="material-symbols-outlined text-primary-container text-4xl">check_circle</span>
                            </div>
                            <h4 className="text-3xl font-black text-white mb-4">100% Precisão</h4>
                            <p className="text-on-surface-variant leading-relaxed">Elimine erros de comunicação. O que o cliente escolhe no cardápio digital é exatamente o que a cozinha produz.</p>
                        </div>
                    </div>
                </section>

                {/* Section 3: The Problem vs. Solution */}
                <section className="max-w-7xl mx-auto px-6 py-24 mb-32 bg-surface-container-lowest/30 rounded-[4rem] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-container/5 blur-[100px] -z-10"></div>
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <div className="relative">
                                <img alt="Customer using BYOD ordering" className="rounded-3xl shadow-2xl border border-white/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZRdvuuCV5JPCqWaVH1RBsPRgivtealGpAiyJj5zbgLRw16xJpe1ERU0WHuNYr_mAwr-BozjX6TM8FQ3M4cSuGpx-2oZLMO3PY6dN-lEZEQwY2jScm3065LD7-9Nq_8szuNAfPCPSEdKSynKIypOewgwYLsd2PKIuEG8qGwYdOn6w8kAZa_yQio7c4mSvyvPH1EzdehOoneoEhVMT-VIt_14q8zfwp9VKDXECXp91Xt2HTpQvZP7CcafBAjFrlS6ryY5kllmY2bq-W"/>
                                <div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl border-primary-container/30 hidden lg:block">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-bold text-primary-container">+20%</span>
                                        <span className="text-xs text-white uppercase font-bold tracking-tighter">Ticket Médio<br/>com fotos HD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <h2 className="text-primary-container font-black uppercase tracking-[0.3em] text-xs mb-4">BYOD: Tecnologia Sem Atrito</h2>
                            <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">O cardápio que seu cliente <span className="italic text-primary-container">já sabe usar</span>.</h3>
                            <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
                                Não obrigue seus clientes a tocarem em tablets engordurados ou menus de papel. Com o BYOD, a jornada começa no próprio celular do cliente, sem necessidade de baixar aplicativos.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary-container bg-primary-container/10 p-1.5 rounded-lg text-xl">qr_code_scanner</span>
                                    <div>
                                        <p className="text-white font-bold">Escaneou, Pediu, Pagou</p>
                                        <p className="text-sm text-on-surface-variant">Fluxo contínuo que reduz o tempo de espera em até 12 minutos.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary-container bg-primary-container/10 p-1.5 rounded-lg text-xl">payments</span>
                                    <div>
                                        <p className="text-white font-bold">Checkout Instantâneo</p>
                                        <p className="text-sm text-on-surface-variant">PIX e Cartão integrados para fechamento de conta autônomo.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Features */}
                <section className="max-w-7xl mx-auto px-6 py-32" id="funcionalidades">
                    <div className="mb-16">
                        <h2 className="text-xs uppercase tracking-[0.4em] text-primary-container font-black mb-4">Experiência de Próxima Geração</h2>
                        <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl">
                            Construído para a <span className="italic">hospitalidade moderna</span>.
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 glass-card rounded-[2.5rem] p-10 relative overflow-hidden group border border-white/5">
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="w-16 h-16 rounded-2xl bg-primary-container/20 flex items-center justify-center mb-8 border border-primary-container/20">
                                        <span className="material-symbols-outlined text-primary-container text-4xl" data-icon="restaurant_menu">restaurant_menu</span>
                                    </div>
                                    <h4 className="text-3xl font-black text-white mb-4">KDS: Sincronização em Tempo Real</h4>
                                    <p className="text-on-surface-variant max-w-md leading-relaxed text-lg">
                                        Adeus ao papel. Pedidos via QR Code são enviados instantaneamente para a cozinha. Organize prioridades e controle tempos de preparo com um toque.
                                    </p>
                                </div>
                            </div>
                            <img className="absolute right-0 bottom-0 w-1/2 h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700 pointer-events-none" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZRdvuuCV5JPCqWaVH1RBsPRgivtealGpAiyJj5zbgLRw16xJpe1ERU0WHuNYr_mAwr-BozjX6TM8FQ3M4cSuGpx-2oZLMO3PY6dN-lEZEQwY2jScm3065LD7-9Nq_8szuNAfPCPSEdKSynKIypOewgwYLsd2PKIuEG8qGwYdOn6w8kAZa_yQio7c4mSvyvPH1EzdehOoneoEhVMT-VIt_14q8zfwp9VKDXECXp91Xt2HTpQvZP7CcafBAjFrlS6ryY5kllmY2bq-W" alt="KDS" />
                        </div>
                        <div className="md:col-span-4 bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between hover:border-primary-container/30 transition-colors">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined text-white text-4xl" data-icon="qr_code_2">qr_code_2</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-white mb-4">Autoatendimento QR</h4>
                                <p className="text-on-surface-variant leading-relaxed">O cliente escaneia, escolhe e paga. Sem aplicativos, sem atrito, sem espera.</p>
                            </div>
                        </div>
                        <div className="md:col-span-4 glass-card rounded-[2.5rem] p-10 border-t-4 border-primary-container">
                            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-8 signature-glow">
                                <span className="material-symbols-outlined text-on-primary text-4xl" data-icon="loyalty">loyalty</span>
                            </div>
                            <h4 className="text-2xl font-bold text-white mb-4">Fidelidade Inteligente</h4>
                            <p className="text-on-surface-variant leading-relaxed">Cashback automático que estimula o retorno do cliente sem esforço manual da sua equipe.</p>
                        </div>
                        <div className="md:col-span-8 bg-surface-container-high rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center border border-white/5">
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-white mb-4">Dashboard de Gestão</h4>
                                <p className="text-on-surface-variant leading-relaxed">Métricas vitais em tempo real. Saiba qual prato é mais rentável e qual horário precisa de mais equipe.</p>
                            </div>
                            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                                <div className="p-6 bg-background rounded-3xl border border-white/5 text-center">
                                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-2">Aumento Ticket</p>
                                    <p className="text-3xl font-black text-primary-container">+28%</p>
                                </div>
                                <div className="p-6 bg-background rounded-3xl border border-white/5 text-center">
                                    <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-2">Satisfação</p>
                                    <p className="text-3xl font-black text-primary-container">4.9/5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Pricing */}
                <section className="max-w-7xl mx-auto px-6 py-32" id="planos">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4">Cresça no seu ritmo</h2>
                        <p className="text-on-surface-variant">Planos flexíveis para cada estágio do seu negócio.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card p-10 rounded-[2.5rem] flex flex-col border border-white/5">
                            <h4 className="text-xl font-bold text-neutral-400 mb-2">Start</h4>
                            <div className="mb-8"><span className="text-5xl font-black text-white">R$ 149</span><span className="text-neutral-500 font-bold">/mês</span></div>
                            <ul className="space-y-4 mb-12 flex-1">
                                <li className="flex items-center gap-3 text-on-surface-variant text-sm font-medium"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> QR Code Ilimitado</li>
                                <li className="flex items-center gap-3 text-on-surface-variant text-sm font-medium"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Cardápio Digital Interativo</li>
                                <li className="flex items-center gap-3 text-on-surface-variant text-sm font-medium"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Gestão de Mesas</li>
                            </ul>
                            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="w-full py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Começar Agora</button>
                        </div>
                        <div className="bg-neutral-900 p-10 rounded-[2.5rem] flex flex-col relative signature-glow border-2 border-primary-container">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-fixed px-5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">Mais Vendido</div>
                            <h4 className="text-xl font-bold text-primary-container mb-2">Growth</h4>
                            <div className="mb-8"><span className="text-5xl font-black text-white">R$ 299</span><span className="text-neutral-500 font-bold">/mês</span></div>
                            <ul className="space-y-4 mb-12 flex-1">
                                <li className="flex items-center gap-3 text-white text-sm font-bold"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Tudo do Start</li>
                                <li className="flex items-center gap-3 text-white text-sm font-bold"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> KDS Kitchen Display</li>
                                <li className="flex items-center gap-3 text-white text-sm font-bold"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Pagamento no QR (PIX/Cartão)</li>
                                <li className="flex items-center gap-3 text-white text-sm font-bold"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Gestão de Estoque</li>
                            </ul>
                            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="w-full py-4 rounded-2xl bg-primary-container text-on-primary-fixed font-black signature-glow transition-all hover:scale-[1.02] active:scale-95">Impulsionar Negócio</button>
                        </div>
                        <div className="glass-card p-10 rounded-[2.5rem] flex flex-col border border-white/5">
                            <h4 className="text-xl font-bold text-neutral-400 mb-2">Scale</h4>
                            <div className="mb-8"><span className="text-4xl font-black text-white">Consultar</span></div>
                            <ul className="space-y-4 mb-12 flex-1">
                                <li className="flex items-center gap-3 text-on-surface-variant text-sm font-medium"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Tudo do Growth</li>
                                <li className="flex items-center gap-3 text-on-surface-variant text-sm font-medium"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> API de Integração</li>
                                <li className="flex items-center gap-3 text-on-surface-variant text-sm font-medium"><span className="material-symbols-outlined text-primary-container text-lg">check_circle</span> Suporte VIP 24/7 Dedicado</li>
                            </ul>
                            <button className="w-full py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all">Falar com Consultor</button>
                        </div>
                    </div>
                </section>
                
                {/* Final CTA */}
                <section className="max-w-6xl mx-auto px-6 py-32">
                    <div className="relative glass-card rounded-[3.5rem] p-12 md:p-20 text-center border border-primary-container/20 overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container/10 blur-[80px] rounded-full"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-container/10 blur-[80px] rounded-full"></div>
                        <div className="relative z-10">
                            <h3 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white mb-6">
                                Pronto para <span className="text-primary-container italic orange-text-glow">aquecer</span> seu negócio?
                            </h3>
                            <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                                Junte-se a centenas de restaurantes que já transformaram sua operação. Comece seu teste gratuito hoje e sinta a diferença no seu fechamento de caixa.
                            </p>
                            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-primary-container text-on-primary-fixed font-black text-xl px-12 py-5 rounded-2xl signature-glow transition-all hover:scale-105 active:scale-95 w-full md:w-auto">
                                    Criar Minha Conta Grátis
                                </button>
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-6 text-neutral-500 text-sm">
                                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary-container text-sm">done</span> Sem setup inicial</span>
                                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-primary-container text-sm">done</span> Cancele quando quiser</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="bg-[#0E0E0E] w-full py-16 border-t border-white/5" id="contato">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="text-xl font-black text-white uppercase tracking-widest font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-container">restaurant</span>
                            Comanda Digital
                        </div>
                        <p className="text-xs uppercase tracking-widest text-neutral-600">© {new Date().getFullYear()} Comanda Digital. Todos os direitos reservados.</p>
                    </div>
                    <div className="flex gap-12">
                        <div className="flex flex-col gap-3">
                            <span className="text-white text-xs font-black uppercase tracking-widest mb-2">Links</span>
                            <a className="text-neutral-500 hover:text-primary-container transition-colors text-xs font-bold uppercase tracking-widest" href="#">Privacidade</a>
                            <a className="text-neutral-500 hover:text-primary-container transition-colors text-xs font-bold uppercase tracking-widest" href="#">Termos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
