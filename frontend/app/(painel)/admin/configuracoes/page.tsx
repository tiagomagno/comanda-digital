'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Store, MapPin, ShieldCheck, Settings } from 'lucide-react';

interface FormData {
    nomeFantasia: string; razaoSocial: string; cnpj: string;
    cep: string; logradouro: string; numero: string; bairro: string; complemento: string;
    cidade: string; estado: string; telefoneComercial: string; instagram: string;
    nomeGestor: string; emailGestor: string; senhaGestor: string;
    aceitaDelivery: boolean; raioEntrega: string; tempoMedioEntrega: string;
    aceitaRetirada: boolean; aceitaConsumoLocal: boolean;
    horarioSegSex: string; horarioSabDom: string;
    pedidoMinimo: string; // vazio = sem pedido mínimo; valor = R$ XX
}

const INITIAL_FORM: FormData = {
    nomeFantasia: '', razaoSocial: '', cnpj: '',
    cep: '', logradouro: '', numero: '', bairro: '', complemento: '',
    cidade: '', estado: 'SP', telefoneComercial: '', instagram: '',
    nomeGestor: '', emailGestor: '', senhaGestor: '',
    aceitaDelivery: true, raioEntrega: '5', tempoMedioEntrega: '45',
    aceitaRetirada: true, aceitaConsumoLocal: false,
    horarioSegSex: '10:00 - 23:00', horarioSabDom: '11:00 - 00:00',
    pedidoMinimo: '',
};

const TABS = [
    { id: 'negocio', label: 'Dados do Negócio', icon: <Store className="w-5 h-5" /> },
    { id: 'endereco', label: 'Endereço e Contato', icon: <MapPin className="w-5 h-5" /> },
    { id: 'responsavel', label: 'Responsável', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'operacao', label: 'Operação', icon: <Settings className="w-5 h-5" /> },
];

function calcPasswordStrength(password: string) {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Senha fraca', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Senha razoável', color: 'bg-yellow-500' };
    if (score === 3) return { level: 3, label: 'Senha boa', color: 'bg-blue-500' };
    return { level: 4, label: 'Senha forte', color: 'bg-green-500' };
}

function maskTelefone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? 'bg-[#FF5C01]' : 'bg-gray-200'}`}>
            <span className={`pointer-events-none block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
}

export default function ConfiguracoesPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('negocio');
    const [data, setFormData] = useState<FormData>(INITIAL_FORM);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [cidades, setCidades] = useState<string[]>([]);
    const [loadingCidades, setLoadingCidades] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const strength = calcPasswordStrength(data.senhaGestor);
    const [pendingChange, setPendingChange] = useState<{ field: keyof FormData; value: boolean } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/auth/login');
            return;
        }

        const fetchUser = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                const baseUrl = apiUrl.replace(/\/api\/?$/, '');
                const response = await fetch(`${baseUrl}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const userData = await response.json();
                    const est = userData.estabelecimento || {};
                    // Campos extras ficam no JSON `configuracoes`
                    let cfg: any = {};
                    try {
                        cfg = typeof est.configuracoes === 'string' ? JSON.parse(est.configuracoes) : (est.configuracoes || {});
                    } catch (e) {
                        cfg = {};
                    }

                    setFormData(prev => ({
                        ...prev,
                        nomeGestor: userData.nome || '',
                        emailGestor: userData.email || '',
                        // nomeFantasia: pode estar em cfg.nomeFantasia (novo) ou est.nome (legado)
                        nomeFantasia: cfg.nomeFantasia || est.nome || '',
                        razaoSocial: cfg.razaoSocial || '',
                        // Colunas diretas do banco
                        cnpj: est.cnpj || '',
                        cep: est.cep || '',
                        cidade: est.cidade || '',
                        estado: est.estado || 'SP',
                        telefoneComercial: est.telefone || '',
                        // Campos do JSON configuracoes
                        logradouro: cfg.logradouro || '',
                        numero: cfg.numero || '',
                        bairro: cfg.bairro || '',
                        complemento: cfg.complemento || '',
                        instagram: cfg.instagram || '',
                        aceitaConsumoLocal: cfg.aceitaConsumoLocal ?? (est.operaLocal || est.operaHospedado || false),
                        aceitaDelivery: cfg.aceitaDelivery ?? (est.operaDelivery || false),
                        aceitaRetirada: cfg.aceitaRetirada ?? true,
                        raioEntrega: cfg.raioEntrega || '5',
                        tempoMedioEntrega: cfg.tempoMedioEntrega || '45',
                        horarioSegSex: cfg.horarioSegSex || '10:00 - 23:00',
                        horarioSabDom: cfg.horarioSabDom || '11:00 - 00:00',
                        pedidoMinimo: typeof cfg.pedidoMinimo === 'number' ? (cfg.pedidoMinimo > 0 ? cfg.pedidoMinimo.toFixed(2) : '') : (cfg.pedidoMinimo ?? ''),
                    }));
                } else {
                    toast.error('Sessão expirada. Faça login novamente.');
                    router.replace('/auth/login');
                }
            } catch (error) {
                console.error('Error fetching config data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    useEffect(() => {
        if (!data.estado) { setCidades([]); return; }
        setLoadingCidades(true);
        fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${data.estado}`)
            .then(res => {
                if (!res.ok) throw new Error('Falha na BrasilAPI');
                return res.json();
            })
            .then(json => {
                if (!Array.isArray(json)) throw new Error('Formato inválido');
                const names = json.map((m: any) => m.nome).sort((a: string, b: string) => a.localeCompare(b));
                setCidades(names);
            })
            .catch(() => toast.error('Erro ao carregar cidades'))
            .finally(() => setLoadingCidades(false));
    }, [data.estado]);

    const onChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleModality = (field: keyof FormData, v: boolean) => {
        if (field === 'aceitaDelivery' || field === 'aceitaConsumoLocal') {
            setPendingChange({ field, value: v });
        } else {
            onChange(field, v);
        }
    };

    const confirmChange = () => {
        if (pendingChange) {
            onChange(pendingChange.field, pendingChange.value);
            setPendingChange(null);
        }
    };

    const buscarCep = async () => {
        const cepLimpo = data.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) { toast.error('CEP inválido'); return; }
        setBuscandoCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const json = await res.json();
            if (json.erro) { toast.error('CEP não encontrado'); return; }
            onChange('logradouro', json.logradouro || '');
            onChange('bairro', json.bairro || '');
            onChange('cidade', json.localidade || '');
            onChange('estado', json.uf || '');
            toast.success('Endereço preenchido!');
        } catch {
            toast.error('Erro ao buscar CEP');
        } finally {
            setBuscandoCep(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const baseUrl = apiUrl.replace(/\/api\/?$/, '');

            const response = await fetch(`${baseUrl}/api/auth/me/estabelecimento`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar as configurações.');
            }

            toast.success('Configurações atualizadas com sucesso!');
            // Efetua um refresh para atualizar o estado global, banner de pending-config etc
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar as configurações.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF5C01]" />
            </div>
        );
    }

    const ESTADOS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                <p className="text-gray-500 mt-1">
                    Gerencie os dados, endereço e métodos de operação do seu estabelecimento.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5">
                    <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Perfil
                    </div>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 ml-2 rounded-xl transition-all font-medium text-sm text-left ${activeTab === tab.id
                                ? 'bg-[#FF5C01]/10 text-[#FF5C01] shadow-sm ring-1 ring-[#FF5C01]/20'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content Area */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

                    {/* TAB: NEGÓCIO */}
                    {activeTab === 'negocio' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Dados do Negócio</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Fantasia <span className="text-red-500">*</span></label>
                                    <input type="text" value={data.nomeFantasia} onChange={(e) => onChange('nomeFantasia', e.target.value)}
                                        placeholder="Como seus clientes conhecem seu negócio?"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social (Opcional)</label>
                                    <input type="text" value={data.razaoSocial} onChange={(e) => onChange('razaoSocial', e.target.value)}
                                        placeholder="Nome jurídico da empresa"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ / CPF <span className="text-red-500">*</span></label>
                                    <input type="text" value={data.cnpj}
                                        onChange={(e) => {
                                            let v = e.target.value.replace(/\D/g, '');
                                            if (v.length <= 11) { v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); }
                                            else { v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18); }
                                            onChange('cnpj', v);
                                        }}
                                        placeholder="00.000.000/0000-00 ou 000.000.000-00"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: ENDEREÇO */}
                    {activeTab === 'endereco' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Endereço e Contato</h2>

                            <div className="flex gap-4 items-end">
                                <div className="flex-1 max-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CEP <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input type="text" value={data.cep} onChange={(e) => onChange('cep', e.target.value)} placeholder="00000-000"
                                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                        <button type="button" onClick={buscarCep} disabled={buscandoCep}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5C01] transition-colors">
                                            {buscandoCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="material-symbols-outlined text-lg">search</span>}
                                        </button>
                                    </div>
                                </div>
                                <div className="pb-2">
                                    <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer" className="text-sm text-[#FF5C01] hover:underline font-medium">Não sei meu CEP</a>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Logradouro <span className="text-red-500">*</span></label>
                                    <input type="text" value={data.logradouro} onChange={(e) => onChange('logradouro', e.target.value)} placeholder="Rua, Avenida..."
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Número <span className="text-red-500">*</span></label>
                                    <input type="text" value={data.numero} onChange={(e) => onChange('numero', e.target.value)} placeholder="123"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bairro <span className="text-red-500">*</span></label>
                                    <input type="text" value={data.bairro} onChange={(e) => onChange('bairro', e.target.value)} placeholder="Centro"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Complemento (Opcional)</label>
                                    <input type="text" value={data.complemento} onChange={(e) => onChange('complemento', e.target.value)} placeholder="Apto, Sala..."
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade {loadingCidades && <span className="text-xs font-normal text-[#FF5C01]">(Carregando...)</span>} <span className="text-red-500">*</span></label>
                                    <select value={data.cidade} onChange={(e) => onChange('cidade', e.target.value)} disabled={loadingCidades || cidades.length === 0}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all">
                                        <option value="" disabled>Selecione...</option>
                                        {cidades.map((cidade) => <option key={cidade} value={cidade}>{cidade}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado <span className="text-red-500">*</span></label>
                                    <select value={data.estado} onChange={(e) => onChange('estado', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all">
                                        {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 my-4" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone Comercial <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">call</span>
                                        <input type="tel" value={data.telefoneComercial}
                                            onChange={(e) => onChange('telefoneComercial', maskTelefone(e.target.value))}
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                                        <input type="text" value={data.instagram} onChange={(e) => onChange('instagram', e.target.value)} placeholder="seurestaurante"
                                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: RESPONSÁVEL */}
                    {activeTab === 'responsavel' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Responsável da Conta</h2>
                            <div className="space-y-5 max-w-xl">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Gestor <span className="text-red-500">*</span></label>
                                    <input type="text" required value={data.nomeGestor} onChange={(e) => onChange('nomeGestor', e.target.value)} placeholder="Nome completo"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail de Acesso <span className="text-red-500">*</span></label>
                                    <input type="email" required value={data.emailGestor} onChange={(e) => onChange('emailGestor', e.target.value)} placeholder="email@exemplo.com.br"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                                    <p className="text-xs text-gray-400 mt-2">O e-mail de acesso não pode ser alterado por aqui.</p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <label className="block text-sm font-semibold text-gray-700">Nova Senha de Acesso</label>
                                        <span className="text-xs text-gray-400">Opcional</span>
                                    </div>
                                    <div className="relative mb-3 group">
                                        <input type={showSenha ? 'text' : 'password'} value={data.senhaGestor} onChange={(e) => onChange('senhaGestor', e.target.value)} placeholder="Deixe em branco para manter a atual"
                                            className="w-full pl-4 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all" />
                                        <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <span className="material-symbols-outlined">{showSenha ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    {data.senhaGestor && (
                                        <>
                                            <div className="flex gap-1.5 h-1.5 w-full mb-2">
                                                {[1, 2, 3, 4].map((bar) => (
                                                    <div key={bar} className={`flex-1 rounded-full transition-all duration-300 ${bar <= strength.level ? strength.color : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs font-medium ${strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-yellow-500' : strength.level === 3 ? 'text-blue-500' : 'text-green-500'}`}>
                                                    {strength.label}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: OPERAÇÃO */}
                    {activeTab === 'operacao' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Configuração Operacional</h2>

                            <div className="space-y-6">
                                {/* Delivery Section */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#FF5C01]/10 text-[#FF5C01] p-3 rounded-xl"><span className="material-symbols-outlined text-2xl">two_wheeler</span></div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">Aceita Delivery</h3>
                                                <p className="text-sm text-gray-500">Entregas e logística do negócio</p>
                                            </div>
                                        </div>
                                        <Toggle checked={data.aceitaDelivery} onChange={(v) => handleToggleModality('aceitaDelivery', v)} />
                                    </div>
                                    {data.aceitaDelivery && (
                                        <div className="p-5 grid grid-cols-2 gap-4 bg-gray-50">
                                            <div>
                                                <label className="text-xs font-bold uppercase text-gray-500">Raio de entrega</label>
                                                <div className="relative mt-2">
                                                    <input type="number" min="1" max="100" value={data.raioEntrega} onChange={(e) => onChange('raioEntrega', e.target.value)}
                                                        className="w-full rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                                                    <span className="absolute right-3 top-2.5 text-gray-400 text-xs">km</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold uppercase text-gray-500">Tempo médio</label>
                                                <div className="relative mt-2">
                                                    <input type="number" min="10" max="180" value={data.tempoMedioEntrega} onChange={(e) => onChange('tempoMedioEntrega', e.target.value)}
                                                        className="w-full rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none" />
                                                    <span className="absolute right-3 top-2.5 text-gray-400 text-xs">min</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pickup and Dine-in */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div onClick={() => handleToggleModality('aceitaRetirada', !data.aceitaRetirada)}
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between cursor-pointer hover:border-[#FF5C01]/40">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${data.aceitaRetirada ? 'bg-[#FF5C01] text-white' : 'bg-[#FF5C01]/10 text-[#FF5C01]'}`}><span className="material-symbols-outlined text-xl">shopping_bag</span></div>
                                            <h3 className="font-bold text-gray-900">Retirada</h3>
                                        </div>
                                        <Toggle checked={data.aceitaRetirada} onChange={(v) => handleToggleModality('aceitaRetirada', v)} />
                                    </div>
                                    <div onClick={() => handleToggleModality('aceitaConsumoLocal', !data.aceitaConsumoLocal)}
                                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between cursor-pointer hover:border-[#FF5C01]/40">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${data.aceitaConsumoLocal ? 'bg-[#FF5C01] text-white' : 'bg-[#FF5C01]/10 text-[#FF5C01]'}`}><span className="material-symbols-outlined text-xl">restaurant</span></div>
                                            <h3 className="font-bold text-gray-900">Consumo Local</h3>
                                        </div>
                                        <Toggle checked={data.aceitaConsumoLocal} onChange={(v) => handleToggleModality('aceitaConsumoLocal', v)} />
                                    </div>
                                </div>

                                {/* Pedido mínimo */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                            <span className="material-symbols-outlined text-sm">payments</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">Pedido mínimo</h3>
                                            <p className="text-xs text-gray-500">Deixe vazio para &quot;Sem pedido mínimo&quot;</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">R$</span>
                                        <input
                                            type="text"
                                            value={data.pedidoMinimo ? data.pedidoMinimo.replace('.', ',') : ''}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, '');
                                                const num = v ? parseInt(v, 10) / 100 : 0;
                                                onChange('pedidoMinimo', num > 0 ? num.toFixed(2) : '');
                                            }}
                                            placeholder="0,00 (vazio = sem mínimo)"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                                    {[
                                        { icon: 'calendar_today', bg: 'bg-blue-100 flex text-blue-600', label: 'Segunda a Sexta', field: 'horarioSegSex' as const },
                                        { icon: 'weekend', bg: 'bg-purple-100 flex text-purple-600', label: 'Sábado e Domingo', field: 'horarioSabDom' as const }
                                    ].map(({ icon, bg, label, field }) => (
                                        <div key={field} className="flex items-center justify-between p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${bg} items-center justify-center`}><span className="material-symbols-outlined text-sm">{icon}</span></div>
                                                <span className="font-bold text-gray-900 text-sm">{label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select value={data[field].split(' - ')[0] || '10:00'} onChange={(e) => onChange(field, `${e.target.value} - ${data[field].split(' - ')[1] || '23:00'}`)}
                                                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-[#FF5C01]/20">
                                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{`${i.toString().padStart(2, '0')}:00`}</option>)}
                                                </select>
                                                <span className="text-gray-400">às</span>
                                                <select value={data[field].split(' - ')[1] || '23:00'} onChange={(e) => onChange(field, `${data[field].split(' - ')[0] || '10:00'} - ${e.target.value}`)}
                                                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-[#FF5C01]/20">
                                                    {Array.from({ length: 24 }).map((_, i) => <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>{`${i.toString().padStart(2, '0')}:00`}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer (Botões de Ação) */}
                    <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#FF5C01] hover:bg-[#e05101] text-white font-bold py-2.5 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70 shrink-0"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Mudança Crítica */}
            {pendingChange && (
                <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-[420px] w-full shadow-2xl relative overflow-hidden">
                        <div className="w-14 h-14 bg-[#FF5C01]/10 text-[#FF5C01] rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <span className="material-symbols-outlined text-2xl">published_with_changes</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Atenção ao alterar o perfil!</h3>
                        <p className="text-gray-500 mb-8 relative z-10 text-sm leading-relaxed">
                            Mudar as configurações base de Delivery ou Consumo Local pode afetar como seus clientes realizam pedidos no sistema.<br /><br />
                            Você tem certeza que deseja prosseguir com essa alteração?
                        </p>
                        <div className="flex gap-3 relative z-10">
                            <button onClick={() => setPendingChange(null)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Cancelar</button>
                            <button onClick={confirmChange} className="flex-1 px-4 py-3 rounded-xl bg-[#FF5C01] hover:bg-[#e05101] text-white font-semibold">Sim, Alterar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
