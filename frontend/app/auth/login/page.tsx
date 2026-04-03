'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginAdminPage() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !senha.trim()) {
            toast.error('Por favor, preencha e-mail e senha');
            return;
        }

        setIsLoading(true);

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const baseUrl = apiUrl.replace(/\/api\/?$/, '');

        try {
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const errMsg =
                    typeof data.error === 'string'
                        ? data.error
                        : data.error?.message || data.message || 'Credenciais inválidas';
                throw new Error(errMsg);
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            toast.success('Bem-vindo!');
            window.location.href = '/admin/dashboard';
        } catch (error: any) {
            const rawMsg = error?.message ?? error;
            const msg = typeof rawMsg === 'string' ? rawMsg : 'Erro ao realizar login';
            if (msg.includes('fetch') || error?.name === 'TypeError') {
                toast.error('Não foi possível conectar ao servidor.');
            } else {
                toast.error(msg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full bg-surface-dim font-sans overflow-hidden">
            {/* Left Side: Interactive Branding/Visual (Split Screen) */}
            <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-lowest items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <img className="w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="atmospheric dark restaurant interior with soft amber lighting, modern minimal furniture, and subtle neon orange accents on black marble surfaces" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4FZp6dRUo_dZtOeAaM2ZRncQY9IR2P5J-Ha4Off6rftOXDQ3EXndsYmbefy0Js4jPnNf37lCSPOwBU3Lz6n2GCraeraAJKkR0V92ipqES_SKg-ktrFHj_CNSDcngvA1RUUnlEMmdH2FyfGkQ2Zb9uruRih7h1AMup7WzlXHwsMyvN0WfoxezmcdyfEgfTMbTdandhwxj8VlXnQ25sHwWbbauFCa9B7iz2izdPC9TksqOVQkHYR7eW8tPxSoxDACFKye37nC1BnWtk"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
                </div>
                <div className="relative z-10 p-16 max-w-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="material-symbols-outlined text-primary-container text-4xl" style={{"fontVariationSettings":"'FILL' 1"}}>restaurant</span>
                        <h1 className="text-3xl font-extrabold tracking-tighter text-white font-display">Comanda Digital</h1>
                    </div>
                    <h2 className="text-5xl font-extrabold font-display text-white leading-[1.1] mb-6 tracking-tight">
                        Culinary <span className="text-primary-container">Kineticism</span> em cada detalhe.
                    </h2>
                    <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-lg">
                        A precisão da tecnologia de ponta encontra o calor da alta hospitalidade. Gerencie seu estabelecimento com a fluidez que ele merece.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-xl">
                            <span className="text-primary-container font-bold text-2xl block mb-1 font-display">99.9%</span>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-medium font-label">Uptime Garantido</span>
                        </div>
                        <div className="glass-card p-6 rounded-xl">
                            <span className="text-primary-container font-bold text-2xl block mb-1 font-display">0.2s</span>
                            <span className="text-xs uppercase tracking-widest text-on-surface-variant font-medium font-label">Latência de Pedido</span>
                        </div>
                    </div>
                </div>
                {/* Kinetic Elements */}
                <div className="absolute bottom-10 right-10 flex gap-4 opacity-50">
                    <div className="w-24 h-24 rounded-full border border-primary-container/20 animate-pulse"></div>
                    <div className="w-12 h-12 rounded-full bg-secondary-container/20 self-end"></div>
                </div>
            </section>
            
            {/* Right Side: Login Form */}
            <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface-dim relative z-10">
                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-display font-bold text-white tracking-tight">Bem-vindo de volta</h3>
                        <p className="text-on-surface-variant">Acesse sua conta para gerenciar seu restaurante.</p>
                    </div>
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label" htmlFor="email">E-mail</label>
                            <div className="relative">
                                <input 
                                    className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary-container/50 rounded-xl px-4 py-4 text-on-surface placeholder:text-surface-variant transition-all outline-none" 
                                    id="email" 
                                    placeholder="nome@exemplo.com" 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-surface-variant">mail</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label" htmlFor="password">Senha</label>
                                <Link className="text-xs font-semibold text-primary-container hover:text-primary transition-colors" href="/auth/esqueci-senha">Esqueci minha senha</Link>
                            </div>
                            <div className="relative">
                                <input 
                                    className="w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary-container/50 rounded-xl px-4 py-4 text-on-surface placeholder:text-surface-variant transition-all outline-none" 
                                    id="password" 
                                    placeholder="••••••••" 
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-surface-variant">lock</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <input className="w-5 h-5 rounded border-none bg-surface-container-highest text-primary-container focus:ring-primary-container focus:ring-offset-background" id="remember" type="checkbox"/>
                            <label className="text-sm text-on-surface-variant select-none" htmlFor="remember">Manter conectado por 30 dias</label>
                        </div>
                        
                        <button 
                            className="w-full bg-primary-container text-on-primary-fixed font-bold py-4 rounded-xl signature-glow hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed" 
                            type="submit"
                            disabled={isLoading}
                        >
                            <span>{isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Entrar'}</span>
                            {!isLoading && <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                        </button>
                    </form>
                    
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-label"><span className="bg-surface-dim px-4 text-on-surface-variant/60">Ou continue com</span></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 glass-card rounded-xl hover:bg-white/5 transition-colors">
                            <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGkCFk63InHGKWq-lcX8kIfZ-yUuIMftBsvHolxJDL3t_YYfFJ7mtbMXcu1YmCXAN1KlXQy1_MbvjkRftud24JhcL3kzmhOz7_Y1Mpiv0z6KTBuGWrsFzj8C0Mu5oIqqsVG6guQTHI0KL3rl1YL1X5zG5Bj-s93cLiyAM1Mmfw5FtknQwtohdkywseAsBXLbaFtklZhaTLMVybHLDu_BpYWpnSgz5CWFNTiayZ-xFFOwMNe7LYYY2ZDa6LsrEU7z7HstG8FWyB1NAo"/>
                            <span className="text-sm font-semibold text-white">Google</span>
                        </button>
                        <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 glass-card rounded-xl hover:bg-white/5 transition-colors">
                            <img alt="LinkedIn" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTZJjS-Ed_Yx8rfmKMs633DHrBFClpOzYlW-n27b_EVFoc-3zkbwcp89lkQkJa-sOUL1Ue5bgkoVECCD-sYZGcjc2h8MUdiw9EH_I48ddthIx4Kzr0cZPtqOoGmLtM1J5e_znIbSAwYIUfoNH98wFSCj0-WLDjPTXVY8R9yyDrMYOcWTsyVOUDq6wLDjC-m45mh0KDSfNLtRz2VOjUSdYh4jHDfGbX4-N884ZqRViWmFvb_XMQeLpH5uZ7E-pP2_8vIUoqYga8XHp4"/>
                            <span className="text-sm font-semibold text-white">LinkedIn</span>
                        </button>
                    </div>
                    
                    <div className="pt-6 text-center">
                        <p className="text-on-surface-variant">
                            Ainda não tem conta? 
                            <Link className="text-primary-container font-bold hover:underline underline-offset-4 ml-1" href="/cadastro">Comece seu trial grátis</Link>
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Footer-like Meta Links (Mobile Optimized) */}
            <footer className="fixed bottom-6 left-0 right-0 pointer-events-none lg:px-24 z-20">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center pointer-events-auto">
                    <div className="hidden md:flex gap-6">
                        <a className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors" href="#">Privacidade</a>
                        <a className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors" href="#">Termos</a>
                        <a className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors" href="#">Suporte</a>
                    </div>
                    <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40">© 2024 Comanda Digital. Culinary Kineticism.</p>
                </div>
            </footer>
        </main>
    );
}
