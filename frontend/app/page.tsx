'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import {
  Menu, X, ArrowRight, Check, ChevronRight,
  Zap, RefreshCw, Star, Headphones, CreditCard,
  LayoutDashboard, Smartphone, TrendingUp,
  QrCode, Monitor, Bike, Layers, Users, UserCog,
} from 'lucide-react';

// ─── Imagens ──────────────────────────────────────────────────────────────────
const HERO_IMG       = 'https://images.unsplash.com/photo-1719204089341-11dec48eae19?w=900&h=700&fit=crop&auto=format';
const STAFF_IMG      = 'https://images.unsplash.com/photo-1779591211588-f0302902a53f?w=800&h=600&fit=crop&auto=format';
const POS_IMG        = 'https://images.unsplash.com/photo-1586864030223-a918b07d357d?w=800&h=600&fit=crop&auto=format';
const RESTAURANT_IMG = 'https://images.unsplash.com/photo-1762087577613-978bf9066d39?w=900&h=700&fit=crop&auto=format';

// ─── Dados ────────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Plataforma', 'Soluções', 'Planos', 'Contato'];

const FEATURES = [
  {
    icon: QrCode,
    label: 'Comanda Digital via QR Code',
    desc: 'O cliente escaneia o QR Code da mesa e acessa a comanda direto no celular — sem app, sem cadastro obrigatório.',
    iconBg: '#ede9fe', iconColor: '#7c3aed',
  },
  {
    icon: Monitor,
    label: 'KDS Multi-Destino',
    desc: 'Pedidos roteados automaticamente para cozinha, bar ou expedição. Cada tela mostra só o que é de sua responsabilidade.',
    iconBg: '#fee2e2', iconColor: '#e52a27',
  },
  {
    icon: Bike,
    label: 'Fluxo de Delivery Completo',
    desc: 'Checkout em 4 etapas com cadastro, endereço e confirmação. Tela dedicada de entregador com gestão de corridas.',
    iconBg: '#dbeafe', iconColor: '#2563eb',
  },
  {
    icon: Layers,
    label: 'Omnichannel — Um Só Painel',
    desc: 'Mesa presencial, delivery e retirada simultâneos com roteamento unificado em um painel admin centralizado.',
    iconBg: '#dcfce7', iconColor: '#16a34a',
  },
  {
    icon: Users,
    label: 'CRM + Automações + Cupons',
    desc: 'Histórico de pedidos, segmentação de clientes e promoções automáticas por gatilho — tudo no painel admin.',
    iconBg: '#ffedd5', iconColor: '#ea580c',
  },
  {
    icon: UserCog,
    label: 'Painel Operacional Multi-Perfil',
    desc: 'Interfaces específicas por função: garçom, caixa, recepção e admin, cada um com fluxo e permissões próprias.',
    iconBg: '#fce7f3', iconColor: '#db2777',
  },
];

const PLANS = [
  {
    name: 'Starter', price: 'R$ 149', period: '/mês', highlight: false, cta: 'Começar Agora',
    features: ['1 ponto de venda (PDV)', 'Cardápio digital ilimitado', 'Pedidos via QR Code', 'Relatórios básicos', 'Suporte por e-mail'],
  },
  {
    name: 'Popular', price: 'R$ 299', period: '/mês', highlight: true, cta: 'Experimentar Grátis',
    features: ['Até 5 pontos de venda', 'Cardápio digital ilimitado', 'Checkout instantâneo', 'Programa de fidelidade', 'Relatórios avançados', 'Suporte prioritário 24/7', 'Integração iFood & Rappi'],
  },
  {
    name: 'Enterprise', price: 'Consultar', period: '', highlight: false, cta: 'Falar com Consultor',
    features: ['PDVs ilimitados', 'Multi-unidades', 'API dedicada', 'SLA garantido', 'Onboarding personalizado', 'Gerente de conta exclusivo'],
  },
];

const WHY = [
  { icon: Zap,           label: 'Plataforma Ágil',     desc: 'Configuração em menos de 24h, sem instalar nada.' },
  { icon: LayoutDashboard, label: 'Menu Personalizado', desc: 'Cardápio 100% customizável com fotos e variações.' },
  { icon: CreditCard,    label: 'Pagamento Seguro',     desc: 'PCI-DSS compliant com todas as bandeiras e Pix.' },
  { icon: Headphones,    label: 'Suporte Dedicado',     desc: 'Time especializado em restaurantes disponível 24/7.' },
];

// ─── Animações ────────────────────────────────────────────────────────────────
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ─── Componente ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', restaurante: '', mensagem: '',
  });

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const yHeroImg = useTransform(heroScroll, [0, 1], ['0%', '25%']);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const handleContato = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert('Mensagem enviada! Nossa equipe entrará em contato em breve.');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-black/5 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="focus:outline-none">
            <Image src="/logos/logo-dine-horizontal-branca-extended.svg" alt="Dine" width={180} height={44} className="hidden dark:block" priority />
            <Image src="/logos/logo-dine-horizontal-branca-extended.svg" alt="Dine" width={180} height={44} className="block dark:hidden filter invert" priority />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))}
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                {l}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => router.push('/auth/login')} className="text-sm font-medium px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors">
              Login
            </button>
            <button onClick={() => scrollTo('contato')} className="text-sm font-semibold px-5 py-2 rounded-full bg-primary-container text-white hover:opacity-90 transition-opacity">
              Começar Grátis
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-neutral-950 border-t border-black/5 dark:border-white/5 px-5 py-4 flex flex-col gap-4">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))}
                className="text-sm font-medium text-left text-neutral-700 dark:text-neutral-300">
                {l}
              </button>
            ))}
            <button onClick={() => { scrollTo('contato'); }} className="w-full text-sm font-semibold py-3 rounded-full bg-primary-container text-white">
              Começar Grátis
            </button>
          </motion.div>
        )}
      </motion.header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="pt-28 pb-16 lg:pt-36 lg:pb-24 px-5 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1 variants={fadeInUp} className="text-4xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 text-center lg:text-left" style={{ letterSpacing: '-0.02em' }}>
              O futuro do seu restaurante na{' '}
              <span className="text-primary-container italic">palma da mão</span> do seu cliente.
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 max-w-xl text-center lg:text-left">
              Diminua filas, aumente pedidos e transforme a experiência do cliente com a plataforma Dine — feita para restaurantes modernos que querem crescer de verdade.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button onClick={() => scrollTo('contato')} className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary-container text-white font-semibold hover:opacity-90 transition-opacity text-sm shadow-lg shadow-red-200 dark:shadow-red-900/30">
                Conhecer Agora <ArrowRight size={16} />
              </button>
              <button onClick={() => scrollTo('plataforma')} className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-black/10 dark:border-white/10 text-neutral-900 dark:text-white font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm">
                Ver Plataforma
              </button>
            </motion.div>

          </motion.div>

          <motion.div
            className="relative"
            style={{ y: yHeroImg }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-neutral-100 dark:bg-neutral-800 aspect-[4/3]">
              <img src={HERO_IMG} alt="Restaurante moderno" className="w-full h-full object-cover" />
            </div>

            <div className="absolute -bottom-6 -left-4 lg:-left-10 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-5 max-w-xs border border-black/5 dark:border-white/5">
              <p className="text-[10px] font-semibold text-primary-container uppercase tracking-widest mb-3">Gestão Inteligente</p>
              <h3 className="text-sm font-bold mb-3 leading-snug">Gestão inteligente, pedido independente.</h3>
              <div className="flex flex-col gap-2">
                {['Dine Hub (Gestão & PDV)', 'DineGo (Experiência do Cliente)'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-primary-container" />
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -top-4 -right-4 lg:-right-8 bg-primary-container rounded-2xl shadow-lg p-4 text-white text-center">
              <p className="text-2xl font-extrabold">+55%</p>
              <p className="text-xs font-medium opacity-80 mt-0.5">Giro de Mesa</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE BAR ─────────────────────────────────────────────────────── */}
      <section className="bg-neutral-950 py-7 overflow-hidden">
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track { animation: marquee 28s linear infinite; }
          .marquee-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="flex">
          <div className="marquee-track flex items-center gap-0 whitespace-nowrap will-change-transform">
            {[...Array(2)].map((_, copy) =>
              ([
                [Smartphone, 'Pedido via QR Code'],
                [RefreshCw,  'Integração iFood & Rappi'],
                [CreditCard, 'Pagamento integrado'],
                [TrendingUp, 'Relatórios em tempo real'],
                [Headphones, 'Suporte 24/7'],
              ] as [React.ElementType, string][]).map(([Icon, label]) => (
                <div key={`${copy}-${label}`} className="flex items-center gap-3 px-10">
                  <Icon size={20} className="text-primary-container flex-shrink-0" />
                  <span className="text-lg font-semibold text-white">{label}</span>
                  <span className="ml-10 text-neutral-700">|</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ──────────────────────────────────────────────────── */}
      <section id="plataforma" className="py-20 lg:py-28 px-5 lg:px-8 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-[380px_1fr]">

              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={stagger}
                className="p-12 lg:p-16 flex flex-col justify-center"
              >
                <motion.p variants={fadeInUp} className="text-xs font-semibold text-primary-container uppercase tracking-widest mb-4">
                  Funcionalidades
                </motion.p>
                <motion.h2 variants={fadeInUp} className="text-3xl lg:text-4xl font-extrabold leading-[1.1] mb-4" style={{ letterSpacing: '-0.025em' }}>
                  Mais que um sistema.{' '}
                  <span className="italic text-neutral-500 dark:text-neutral-400">Uma máquina de lucros.</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
                  Cada funcionalidade foi desenhada para resolver um problema real de quem opera um restaurante no dia a dia.
                </motion.p>
                <motion.button variants={fadeInUp} onClick={() => scrollTo('solucoes')} className="flex items-center gap-2 self-start px-6 py-3 rounded-full bg-primary-container text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                  Ver plataforma completa <ArrowRight size={15} />
                </motion.button>
              </motion.div>

              <motion.div
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={stagger}
                className="grid sm:grid-cols-2"
              >
                {FEATURES.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.label}
                      variants={fadeInUp}
                      className="p-10 flex gap-5"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: f.iconBg }}>
                        <Icon size={22} style={{ color: f.iconColor }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2 leading-snug">{f.label}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────────────────────── */}
      <section className="bg-neutral-950 dark:bg-black py-16 px-5 lg:px-8">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={stagger}
          className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-white"
        >
          {[
            { n: '< 24h',  l: 'Para entrar no ar' },
            { n: '100%',   l: 'Sem papel na operação' },
            { n: '4,9★',   l: 'Avaliação média' },
          ].map(s => (
            <motion.div key={s.l} variants={fadeInUp} className="text-center">
              <p className="text-4xl font-extrabold mb-1" style={{ letterSpacing: '-0.03em' }}>{s.n}</p>
              <p className="text-white/50 text-sm font-medium">{s.l}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── DEPOIMENTO (oculto — aguardando depoimento real) ─────────────────── */}

      {/* ── PLANOS ──────────────────────────────────────────────────────────── */}
      <section id="planos" className="py-20 lg:py-28 px-5 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeInUp} className="text-xs font-semibold text-primary-container uppercase tracking-widest mb-3">Planos</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-extrabold" style={{ letterSpacing: '-0.02em' }}>
              Cresça no seu ritmo
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-neutral-500 dark:text-neutral-400 mt-4 text-sm">
              Sem taxa de setup. Cancele quando quiser.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map(plan => (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                className={`rounded-2xl p-7 flex flex-col relative ${plan.highlight
                  ? 'bg-primary-container text-white shadow-2xl shadow-red-200 dark:shadow-red-900/30 scale-[1.02]'
                  : 'bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neutral-950 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Mais Popular
                  </span>
                )}
                <div className="mb-6">
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-white/60' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : ''}`} style={{ letterSpacing: '-0.03em' }}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-neutral-500 dark:text-neutral-400'}`}>{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlight ? 'bg-white/20' : 'bg-white dark:bg-neutral-800'}`}>
                        <Check size={10} className={plan.highlight ? 'text-white' : 'text-primary-container'} />
                      </span>
                      <span className={plan.highlight ? 'text-white/80' : 'text-neutral-600 dark:text-neutral-400'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => scrollTo('contato')}
                  className={`w-full py-3 rounded-full font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 ${plan.highlight
                    ? 'bg-white text-primary-container hover:opacity-90'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── POR QUE A DINE ──────────────────────────────────────────────────── */}
      <section id="solucoes" className="py-20 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="lg:sticky lg:top-24">
              <motion.p variants={fadeInUp} className="text-xs font-semibold text-primary-container uppercase tracking-widest mb-4">Por que a Dine?</motion.p>
              <motion.h2 variants={fadeInUp} className="text-4xl lg:text-5xl font-extrabold leading-[1.08] mb-5" style={{ letterSpacing: '-0.025em' }}>
                Tudo que seu restaurante precisa,{' '}
                <span className="italic text-neutral-500 dark:text-neutral-400">em um só lugar.</span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-8 max-w-sm">
                A Dine foi construída do zero para restaurantes. Cada funcionalidade resolve um problema real de quem opera no dia a dia de um negócio de alimentação.
              </motion.p>
              <motion.button variants={fadeInUp} onClick={() => scrollTo('contato')} className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary-container text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-red-200 dark:shadow-red-900/30">
                Começar Grátis <ArrowRight size={15} />
              </motion.button>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-black/5 dark:divide-white/5 sm:divide-x border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900"
            >
              {WHY.map(w => {
                const Icon = w.icon;
                return (
                  <motion.div key={w.label} variants={fadeInUp} className="p-7 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl border border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Icon size={17} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1.5">{w.label}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{w.desc}</p>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold hover:text-primary-container transition-colors mt-auto pt-2 self-start">
                      Saiba mais <ChevronRight size={13} /><ChevronRight size={13} className="-ml-2" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        className="mx-5 lg:mx-8 mb-16 rounded-3xl bg-neutral-950 text-white overflow-hidden relative"
      >
        <img src={RESTAURANT_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 text-center py-16 px-6">
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-4 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Pronto para transformar<br />seu restaurante?
          </h2>
          <p className="text-white/60 mb-8 text-sm max-w-md mx-auto leading-relaxed">
            Transforme a operação do seu restaurante com a plataforma Dine. Teste grátis por 14 dias.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => scrollTo('contato')} className="px-8 py-3.5 rounded-full bg-primary-container text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              Começar Grátis por 14 dias <ArrowRight size={15} />
            </button>
            <button onClick={() => scrollTo('plataforma')} className="px-8 py-3.5 rounded-full border border-white/20 text-white font-semibold text-sm hover:border-white/40 transition-colors">
              Ver Demonstração
            </button>
          </div>
        </div>
      </motion.section>

      {/* ── CONTATO ─────────────────────────────────────────────────────────── */}
      <section id="contato" className="py-20 lg:py-28 px-5 lg:px-8 bg-neutral-100 dark:bg-neutral-900/50 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeInUp} className="text-xs font-semibold text-primary-container uppercase tracking-widest mb-3">Fale Conosco</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl lg:text-5xl font-extrabold mb-5 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Entre em <span className="text-primary-container italic">Contato</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-8 max-w-md">
              Pronto para transformar seu restaurante? Nosso time de especialistas entra em contato em até 2 horas úteis para uma demonstração personalizada.
            </motion.p>

            <motion.div variants={stagger} className="flex flex-col gap-4 mb-8">
              {WHY.slice(0, 3).map(w => {
                const Icon = w.icon;
                return (
                  <motion.div key={w.label} variants={fadeInUp} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 border border-black/5 dark:border-white/5">
                      <Icon size={16} className="text-primary-container" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{w.label}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{w.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div variants={fadeInUp} className="rounded-2xl overflow-hidden">
              <img src={STAFF_IMG} alt="Equipe Dine" className="w-full h-52 object-cover" />
            </motion.div>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeInUp} className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-black/5 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold mb-6">Solicitar Demonstração</h3>
            <form className="flex flex-col gap-4" onSubmit={handleContato}>
              {([
                ['nome',        'Nome completo'],
                ['email',       'E-mail profissional'],
                ['telefone',    'Telefone / WhatsApp'],
                ['restaurante', 'Nome do restaurante'],
              ] as [keyof typeof formData, string][]).map(([key, placeholder]) => (
                <input
                  key={key}
                  type={key === 'email' ? 'email' : 'text'}
                  placeholder={placeholder}
                  required
                  value={formData[key]}
                  onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container placeholder:text-neutral-400 transition-all"
                />
              ))}
              <textarea
                placeholder="Como podemos ajudar? (opcional)"
                rows={3}
                value={formData.mensagem}
                onChange={e => setFormData(p => ({ ...p, mensagem: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container placeholder:text-neutral-400 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-primary-container text-white font-semibold text-sm hover:opacity-90 transition-opacity mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />}
                Solicitar Demonstração Gratuita <ArrowRight size={15} />
              </button>
              <p className="text-center text-xs text-neutral-400">Sem compromisso. Respondemos em até 2 horas úteis.</p>
            </form>
          </motion.div>

        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/5 dark:border-white/5 px-5 lg:px-8 py-12 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            <div className="lg:col-span-2">
              <Image src="/logos/logo-dine-horizontal-branca-extended.svg" alt="Dine" width={120} height={30} className="hidden dark:block mb-3" />
              <Image src="/logos/logo-dine-horizontal-branca-extended.svg" alt="Dine" width={120} height={30} className="block dark:hidden filter invert mb-3" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
                A plataforma de gestão para restaurantes modernos que querem crescer sem complicar.
              </p>
            </div>

            {[
              { title: 'Produto',  links: ['Cardápio Digital', 'Dine Hub (PDV)', 'DineGo', 'KDS Inteligente', 'Dine Pay'] },
              { title: 'Empresa',  links: ['Sobre nós', 'Blog', 'Carreiras', 'Imprensa'] },
              { title: 'Suporte',  links: ['Central de Ajuda', 'Documentação API', 'Status', 'Privacidade', 'Termos'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-3">{col.title}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-black/5 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-neutral-500">© {new Date().getFullYear()} Dine Tecnologia para Restaurantes LTDA. Todos os direitos reservados.</p>
            <p className="text-xs text-neutral-500">Feito com ♥ no Brasil 🇧🇷</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
