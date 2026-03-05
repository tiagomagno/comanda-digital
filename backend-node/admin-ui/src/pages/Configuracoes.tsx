import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { ContentHeader } from '@/components/Layout/ContentHeader'

export function Configuracoes() {
    useAuth()
    const { theme, updateTheme, darkMode, setDarkMode } = useTheme()

    const [nomePortal, setNomePortal] = useState('Notícias 360')
    const [descricao, setDescricao] = useState('O seu portal de notícias completo e atualizado 24 horas por dia.')
    const [corPrimaria, setCorPrimaria] = useState(theme.primary)
    const [corSecundaria, setCorSecundaria] = useState(theme.secondary)
    const [tipografia, setTipografia] = useState('Lufga')
    const [instagram, setInstagram] = useState('noticias360')
    const [facebook, setFacebook] = useState('noticias360oficial')
    const [twitter, setTwitter] = useState('')
    const [youtube, setYoutube] = useState('')
    const [notificacoes, setNotificacoes] = useState(true)
    const [comentarios, setComentarios] = useState(false)
    const [idioma, setIdioma] = useState('Português (BR)')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [buscaConfig, setBuscaConfig] = useState('')

    const logoInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setCorPrimaria(theme.primary)
        setCorSecundaria(theme.secondary)
    }, [theme.primary, theme.secondary])

    const handleSave = () => {
        setSaving(true)
        updateTheme(corPrimaria, corSecundaria)
        setTimeout(() => {
            setSaving(false)
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        }, 1000)
    }

    return (
        <div className="px-8 pt-8 pb-24 max-w-[1600px] mx-auto min-h-full font-sans">

            <ContentHeader
                title="Configurações do Portal"
                subtitle="Gerencie as preferências e identidade visual do seu portal."
                searchPlaceholder="Buscar configurações..."
                searchValue={buscaConfig}
                onSearchChange={setBuscaConfig}
            />

            {/* GRID PRINCIPAL 2 COLUNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ── Perfil do Portal ── */}
                <section className="card-panel p-8">
                    <h2 className="text-[13px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-8 dark:text-primary">
                        <span className="material-symbols-outlined text-[18px] text-[#E11D48]">account_circle</span>
                        Perfil do Portal
                    </h2>

                    <div className="flex flex-col gap-6">
                        {/* Upload Logo */}
                        <div className="flex items-start gap-5">
                            <input ref={logoInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" />
                            <div
                                onClick={() => logoInputRef.current?.click()}
                                className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/50 cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all group dark:bg-accent dark:border-border dark:hover:bg-accent/80"
                            >
                                <span className="material-symbols-outlined text-3xl mb-1 group-hover:text-secondary transition-colors">upload</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-secondary">Logo</span>
                            </div>
                            <div className="flex-1 pt-2">
                                <p className="text-[13px] text-muted-foreground font-medium mb-3">Recomendado: 512×512px, formato PNG com fundo transparente.</p>
                                <button className="text-[12px] font-bold text-secondary hover:text-secondary/90 transition-colors">Remover imagem atual</button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">Nome do Portal</label>
                            <input
                                className="w-full px-5 py-3.5 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-foreground dark:bg-accent dark:border-border dark:text-foreground dark:placeholder-muted-foreground"
                                type="text"
                                value={nomePortal}
                                onChange={e => setNomePortal(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">Descrição Curta (SEO)</label>
                            <textarea
                                className="w-full px-5 py-3.5 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-foreground resize-none dark:bg-accent dark:border-border dark:text-foreground dark:placeholder-muted-foreground"
                                rows={3}
                                value={descricao}
                                onChange={e => setDescricao(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* ── Identidade Visual ── */}
                <section className="card-panel p-8">
                    <h2 className="text-[13px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-8 dark:text-primary">
                        <span className="material-symbols-outlined text-[18px] text-[#E11D48]">palette</span>
                        Identidade Visual
                    </h2>

                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">Cor Primária</label>
                                <div className="flex items-center gap-3">
                                    <label
                                        className="w-11 h-11 rounded-xl shadow-sm border border-border cursor-pointer flex-shrink-0 overflow-hidden dark:border-border"
                                        style={{ backgroundColor: corPrimaria }}
                                    >
                                        <input
                                            type="color"
                                            value={corPrimaria}
                                            onChange={e => setCorPrimaria(e.target.value)}
                                            className="opacity-0 w-0 h-0"
                                        />
                                    </label>
                                    <input
                                        className="flex-1 px-4 py-3 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[13px] font-medium font-mono uppercase text-foreground dark:bg-accent dark:border-border dark:text-foreground"
                                        type="text"
                                        value={corPrimaria}
                                        onChange={e => setCorPrimaria(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">Cor Secundária</label>
                                <div className="flex items-center gap-3">
                                    <label
                                        className="w-11 h-11 rounded-xl shadow-sm border border-border cursor-pointer flex-shrink-0 overflow-hidden dark:border-border"
                                        style={{ backgroundColor: corSecundaria }}
                                    >
                                        <input
                                            type="color"
                                            value={corSecundaria}
                                            onChange={e => setCorSecundaria(e.target.value)}
                                            className="opacity-0 w-0 h-0"
                                        />
                                    </label>
                                    <input
                                        className="flex-1 px-4 py-3 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[13px] font-medium font-mono uppercase text-foreground dark:bg-accent dark:border-border dark:text-foreground"
                                        type="text"
                                        value={corSecundaria}
                                        onChange={e => setCorSecundaria(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">Tipografia Base</label>
                            <div className="relative">
                                <select
                                    className="w-full px-5 py-3.5 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-foreground appearance-none dark:bg-accent dark:border-border dark:text-foreground"
                                    value={tipografia}
                                    onChange={e => setTipografia(e.target.value)}
                                >
                                    <option value="Lufga">Lufga (Atual)</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Work Sans">Work Sans</option>
                                    <option value="Roboto">Roboto</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px] dark:text-[#E2E8F0]">expand_more</span>
                            </div>
                        </div>

                        {/* Preview das cores */}
                        <div className="mt-2 p-4 rounded-2xl border border-border bg-muted/40 dark:bg-accent dark:border-border">
                            <p className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] mb-3 dark:text-card-foreground">Prévia</p>
                            <div className="flex items-center gap-3">
                                <span
                                    className="px-4 py-2 rounded-full text-white text-[12px] font-bold"
                                    style={{ backgroundColor: corPrimaria }}
                                >
                                    Cor Primária
                                </span>
                                <span
                                    className="px-4 py-2 rounded-full text-white text-[12px] font-bold"
                                    style={{ backgroundColor: corSecundaria }}
                                >
                                    Cor Secundária
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Redes Sociais ── */}
                <section className="card-panel p-8">
                    <h2 className="text-[13px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-8 dark:text-primary">
                        <span className="material-symbols-outlined text-[18px] text-[#E11D48]">share</span>
                        Redes Sociais
                    </h2>

                    <div className="flex flex-col gap-5">
                        {[
                            { label: 'Instagram', prefix: '@', value: instagram, setter: setInstagram, placeholder: 'noticias360' },
                            { label: 'Facebook', prefix: '/', value: facebook, setter: setFacebook, placeholder: 'noticias360oficial' },
                            { label: 'X (Twitter)', prefix: '@', value: twitter, setter: setTwitter, placeholder: 'noticias360' },
                            { label: 'YouTube', prefix: '/', value: youtube, setter: setYoutube, placeholder: '@noticias360' },
                        ].map(({ label, prefix, value, setter, placeholder }) => (
                            <div key={label} className="flex flex-col gap-2">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">{label}</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-[14px] dark:text-[#E2E8F0]">{prefix}</span>
                                    <input
                                        className="w-full pl-10 pr-5 py-3.5 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-foreground placeholder-muted-foreground dark:bg-accent dark:border-border dark:text-foreground dark:placeholder-muted-foreground"
                                        type="text"
                                        placeholder={placeholder}
                                        value={value}
                                        onChange={e => setter(e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Preferências de Sistema ── */}
                <section className="card-panel p-8">
                    <h2 className="text-[13px] font-bold text-primary uppercase tracking-[0.2em] font-sans flex items-center gap-2 mb-8 dark:text-primary">
                        <span className="material-symbols-outlined text-[18px] text-[#E11D48]">toggle_on</span>
                        Preferências de Sistema
                    </h2>

                    <div className="flex flex-col gap-6">
                        {/* Toggles */}
                        {[
                            {
                                title: 'Modo Escuro (Painel)',
                                desc: 'Alternar tema da interface de administração.',
                                value: darkMode,
                                toggle: () => setDarkMode(!darkMode),
                            },
                            {
                                title: 'Notificações por E-mail',
                                desc: 'Receber alertas sobre novas publicações e revisões.',
                                value: notificacoes,
                                toggle: () => setNotificacoes(v => !v),
                            },
                            {
                                title: 'Comentários no Portal',
                                desc: 'Permitir comentários dos leitores nas notícias.',
                                value: comentarios,
                                toggle: () => setComentarios(v => !v),
                            },
                        ].map(({ title, desc, value, toggle }, i) => (
                            <div key={i}>
                                {i > 0 && <hr className="border-border mb-6" />}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-[14px] text-foreground mb-0.5">{title}</h3>
                                        <p className="text-[13px] font-medium text-muted-foreground">{desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={toggle}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${value ? 'bg-primary' : 'bg-muted'}`}
                                    >
                                        <span className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <hr className="border-border" />

                        <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] font-sans dark:text-[#E2E8F0]">Idioma Principal</label>
                            <div className="relative">
                                <select
                                    className="w-full px-5 py-3.5 rounded-2xl bg-card border border-input focus:ring-2 focus:ring-primary focus:outline-none text-[14px] font-medium font-sans text-foreground appearance-none dark:bg-accent dark:border-border dark:text-foreground"
                                    value={idioma}
                                    onChange={e => setIdioma(e.target.value)}
                                >
                                    <option value="Português (BR)">Português (BR)</option>
                                    <option value="English (US)">English (US)</option>
                                    <option value="Español">Español</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-[20px] dark:text-[#E2E8F0]">expand_more</span>
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            {/* ── FOOTER FLUTUANTE SALVAR ── */}
            <div className="fixed bottom-8 right-8 z-40 flex items-center gap-4">
                {saved && (
                    <div className="bg-[#10B981] text-white px-5 py-3 rounded-full text-[12px] font-bold flex items-center gap-2 shadow-lg animate-fade-in">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Salvo com sucesso!
                    </div>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-secondary text-white hover:bg-secondary/90 px-8 py-3.5 rounded-full font-bold inline-flex items-center gap-2 transition-all shadow-xl font-sans tracking-[0.1em] text-[12px] uppercase disabled:opacity-70"
                >
                    {saving ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined text-[18px]">save</span>
                    )}
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

        </div>
    )
}
