'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface FormData {
    // Step 1 — Dados
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    // Step 2 — Endereço
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    complemento: string;
    cidade: string;
    estado: string;
    telefoneComercial: string;
    instagram: string;
    // Step 3 — Responsável
    nomeGestor: string;
    emailGestor: string;
    senhaGestor: string;
    // Step 4 — Operação
    aceitaDelivery: boolean;
    raioEntrega: string;
    tempoMedioEntrega: string;
    aceitaRetirada: boolean;
    aceitaConsumoLocal: boolean;
    horarioSegSex: string;
    horarioSabDom: string;
    // Step 5 — Termos
    aceitaTermos: boolean;
    aceitaPrivacidade: boolean;
    autorizaLgpd: boolean;
    receberNovidades: boolean;
}

const INITIAL_FORM: FormData = {
    nomeFantasia: '', razaoSocial: '', cnpj: '',
    cep: '', logradouro: '', numero: '', bairro: '', complemento: '',
    cidade: '', estado: 'SP', telefoneComercial: '', instagram: '',
    nomeGestor: '', emailGestor: '', senhaGestor: '',
    aceitaDelivery: true, raioEntrega: '5', tempoMedioEntrega: '45',
    aceitaRetirada: true, aceitaConsumoLocal: false,
    horarioSegSex: '10:00 - 23:00', horarioSabDom: '11:00 - 00:00',
    aceitaTermos: false, aceitaPrivacidade: false, autorizaLgpd: false, receberNovidades: false,
};

// ─── Máscara de Telefone ─────────────────────────────────────────────────────
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

// ─── Progress Bar (tabs estilo Stitch) ───────────────────────────────────────
const TABS = [
    { step: 1, label: 'Dados do Negócio' },
    { step: 2, label: 'Endereço e Contato' },
    { step: 3, label: 'Responsável' },
    { step: 4, label: 'Operação' },
    { step: 5, label: 'Termos' },
];

function ProgressBar({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex items-end gap-1.5">
            {TABS.map((tab) => (
                <div key={tab.step} className="flex flex-col items-center gap-1 min-w-0" style={{ width: `${100 / TABS.length}%` }}>
                    <span
                        className={`text-[10px] font-semibold truncate w-full text-center leading-tight transition-colors ${tab.step < currentStep
                            ? 'text-[#FF5C01]'
                            : tab.step === currentStep
                                ? 'text-[#FF5C01]'
                                : 'text-gray-300'
                            }`}
                    >
                        {tab.label}
                    </span>
                    <div
                        className={`w-full h-1 rounded-full transition-all duration-500 ${tab.step <= currentStep ? 'bg-[#FF5C01]' : 'bg-gray-200'
                            }`}
                    />
                </div>
            ))}
        </div>
    );
}


// ─── Botões de navegação (padrão reutilizável) ────────────────────────────────
interface NavButtonsProps {
    onBack?: () => void;
    isLast?: boolean;
    isLoading?: boolean;
    backLabel?: string;
    nextLabel?: string;
}

function NavButtons({ onBack, isLast, isLoading, backLabel = 'Voltar', nextLabel = 'Próximo Passo' }: NavButtonsProps) {
    return (
        <div className="mt-auto pt-8 flex items-center justify-between gap-4 border-t border-gray-100">
            <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
                {backLabel}
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className="bg-[#FF5C01] hover:bg-[#e05101] text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-60"
            >
                {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                {nextLabel}
                {!isLast && (
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">
                        arrow_forward
                    </span>
                )}
            </button>
        </div>
    );
}

// ─── STEP 1: Dados do Estabelecimento ────────────────────────────────────────
interface Step1Props {
    data: FormData;
    onChange: (field: keyof FormData, value: string) => void;
    onNext: () => void;
}

function Step1({ data, onChange, onNext }: Step1Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.nomeFantasia.trim()) { toast.error('Nome Fantasia é obrigatório'); return; }
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Dados do Estabelecimento</h1>
                <p className="text-gray-500 text-lg">Preencha as informações básicas do seu negócio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nome_fantasia">Nome Fantasia</label>
                    <input id="nome_fantasia" type="text" required value={data.nomeFantasia}
                        onChange={(e) => onChange('nomeFantasia', e.target.value)}
                        placeholder="Como seus clientes conhecem seu negócio?"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm" />
                </div>
                <div className="md:col-span-2">
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="block text-sm font-semibold text-gray-700" htmlFor="razao_social">Razão Social</label>
                        <span className="text-xs text-gray-400">Opcional</span>
                    </div>
                    <input id="razao_social" type="text" value={data.razaoSocial}
                        onChange={(e) => onChange('razaoSocial', e.target.value)}
                        placeholder="Nome jurídico da empresa"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="cnpj">CNPJ / CPF</label>
                    <input id="cnpj" type="text" value={data.cnpj}
                        onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length <= 11) {
                                v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                            } else {
                                v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);
                            }
                            onChange('cnpj', v);
                        }}
                        placeholder="00.000.000/0000-00 ou 000.000.000-00"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none shadow-sm" />
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-end">
                <button type="submit"
                    className="bg-[#FF5C01] hover:bg-[#e05101] text-white font-semibold py-3 px-8 rounded-lg shadow-md shadow-orange-500/20 flex items-center gap-2 group transition-all transform hover:-translate-y-0.5">
                    Próximo Passo
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">arrow_forward</span>
                </button>
            </div>
        </form>
    );
}

// ─── STEP 2: Endereço e Contato ───────────────────────────────────────────────
interface Step2Props {
    data: FormData;
    onChange: (field: keyof FormData, value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

function Step2({ data, onChange, onNext, onBack }: Step2Props) {
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [cidades, setCidades] = useState<string[]>([]);
    const [loadingCidades, setLoadingCidades] = useState(false);

    useEffect(() => {
        if (!data.estado) {
            setCidades([]);
            return;
        }
        
        setLoadingCidades(true);
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${data.estado}/municipios`)
            .then(async (res) => {
                if (!res.ok) throw new Error('Falha na API do IBGE');
                return res.json();
            })
            .then((json) => {
                if (!Array.isArray(json)) throw new Error('Formato inválido do IBGE');
                
                const names = json
                    .map((m: any) => m.nome)
                    .sort((a: string, b: string) => a.localeCompare(b));
                    
                setCidades(names);
            })
            .catch((err) => {
                console.error(err);
                toast.error('Erro ao carregar cidades. Verifique sua conexão.');
                setCidades([]);
            })
            .finally(() => setLoadingCidades(false));
    }, [data.estado]);

    const buscarCep = async () => {
        const cepLimpo = data.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) { toast.error('CEP inválido'); return; }
        
        setBuscandoCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            if (!res.ok) throw new Error('Falha no ViaCEP');
            const json = await res.json();
            
            if (json.erro) { toast.error('CEP não encontrado'); return; }
            
            onChange('logradouro', json.logradouro || '');
            onChange('bairro', json.bairro || '');
            // O estado muda e engatilha o useEffect, portanto a cidade vai preencher o dropdown
            onChange('estado', json.uf || '');
            
            // Para garantir que a cidade será definida corretamente caso o estado já seja o mesmo
            onChange('cidade', json.localidade || '');
            
            toast.success('Endereço preenchido!');
        } catch (err) {
            console.error(err);
            toast.error('Erro ao buscar CEP');
        } finally {
            setBuscandoCep(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.logradouro.trim()) { toast.error('Logradouro é obrigatório'); return; }
        if (!data.numero.trim()) { toast.error('Número é obrigatório'); return; }
        if (!data.cidade.trim()) { toast.error('Cidade é obrigatória'); return; }
        onNext();
    };

    const ESTADOS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Onde fica seu negócio?</h1>
                <p className="text-gray-500 text-lg">Precisamos do endereço para configurar sua área de entrega e contato.</p>
            </div>

            <div className="space-y-5">
                {/* CEP */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="cep">CEP</label>
                        <div className="relative">
                            <input id="cep" type="text" value={data.cep}
                                onChange={(e) => onChange('cep', e.target.value)}
                                placeholder="00000-000"
                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                            <button type="button" onClick={buscarCep} disabled={buscandoCep}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF5C01] transition-colors">
                                {buscandoCep
                                    ? <Loader2 className="h-5 w-5 animate-spin" />
                                    : <span className="material-symbols-outlined text-xl">search</span>
                                }
                            </button>
                        </div>
                    </div>
                    <div className="pb-3">
                        <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noreferrer"
                            className="text-sm text-[#FF5C01] hover:underline font-medium">
                            Não sei meu CEP
                        </a>
                    </div>
                </div>

                {/* Logradouro + Número */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="logradouro">Logradouro</label>
                        <input id="logradouro" type="text" value={data.logradouro}
                            onChange={(e) => onChange('logradouro', e.target.value)}
                            placeholder="Rua, Avenida..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="numero">Número</label>
                        <input id="numero" type="text" value={data.numero}
                            onChange={(e) => onChange('numero', e.target.value)}
                            placeholder="123"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                    </div>
                </div>

                {/* Bairro + Complemento */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="bairro">Bairro</label>
                        <input id="bairro" type="text" value={data.bairro}
                            onChange={(e) => onChange('bairro', e.target.value)}
                            placeholder="Centro"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="complemento">
                            Complemento <span className="text-gray-400 font-normal text-xs">(Opcional)</span>
                        </label>
                        <input id="complemento" type="text" value={data.complemento}
                            onChange={(e) => onChange('complemento', e.target.value)}
                            placeholder="Apto, Sala..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                    </div>
                </div>

                {/* Cidade + Estado */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="cidade">
                            Cidade {loadingCidades && <span className="text-xs font-normal text-[#FF5C01]">(Carregando...)</span>}
                        </label>
                        <div className="relative">
                            <select id="cidade" value={data.cidade}
                                onChange={(e) => onChange('cidade', e.target.value)}
                                disabled={loadingCidades || cidades.length === 0}
                                className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 appearance-none outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
                                <option value="" disabled>Selecione...</option>
                                {cidades.map((cidade) => <option key={cidade} value={cidade}>{cidade}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xl">expand_more</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="estado">Estado</label>
                        <div className="relative">
                            <select id="estado" value={data.estado}
                                onChange={(e) => onChange('estado', e.target.value)}
                                className="w-full pl-4 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 appearance-none outline-none">
                                {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xl">expand_more</span>
                        </div>
                    </div>
                </div>

                {/* Divisor */}
                <div className="h-px bg-gray-100 my-2" />

                {/* Contato Público */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#FF5C01]">contacts</span>
                        Contato Público
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="telefone_comercial">Telefone Comercial</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">call</span>
                                <input id="telefone_comercial" type="tel" value={data.telefoneComercial}
                                    onChange={(e) => onChange('telefoneComercial', maskTelefone(e.target.value))}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="instagram">Instagram</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">@</span>
                                <input id="instagram" type="text" value={data.instagram}
                                    onChange={(e) => onChange('instagram', e.target.value)}
                                    placeholder="seurestaurante"
                                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] text-gray-900 placeholder-gray-400 transition-all outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NavButtons onBack={onBack} />
        </form>
    );
}

// ─── Helpers de força de senha ────────────────────────────────────────────────
function calcPasswordStrength(password: string): { level: number; label: string; color: string } {
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

// ─── STEP 3: Responsável da Conta ─────────────────────────────────────────────
interface Step3Props {
    data: FormData;
    onChange: (field: keyof FormData, value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

function Step3({ data, onChange, onNext, onBack }: Step3Props) {
    const [showSenha, setShowSenha] = useState(false);
    const strength = calcPasswordStrength(data.senhaGestor);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.nomeGestor.trim()) { toast.error('Nome do gestor é obrigatório'); return; }
        if (!data.emailGestor.trim()) { toast.error('E-mail de acesso é obrigatório'); return; }
        if (data.senhaGestor && data.senhaGestor.length < 8) { toast.error('A senha deve ter no mínimo 8 caracteres'); return; }
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Responsável da Conta</h1>
                <p className="text-gray-500 text-lg">Defina quem será o administrador principal do sistema.</p>
            </div>

            <div className="space-y-5">
                {/* Nome do Gestor */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="nome-gestor">Nome do Gestor</label>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5C01] transition-colors text-[22px]">person</span>
                        <input
                            id="nome-gestor"
                            type="text"
                            required
                            value={data.nomeGestor}
                            onChange={(e) => onChange('nomeGestor', e.target.value)}
                            placeholder="Nome completo do responsável"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none shadow-sm text-gray-900 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* E-mail */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email-gestor">E-mail de Acesso</label>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5C01] transition-colors text-[22px]">mail</span>
                        <input
                            id="email-gestor"
                            type="email"
                            required
                            value={data.emailGestor}
                            onChange={(e) => onChange('emailGestor', e.target.value)}
                            placeholder="email@exemplo.com.br"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none shadow-sm text-gray-900 placeholder-gray-400"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">Este e-mail será usado para login e recuperação de senha.</p>
                </div>

                {/* Senha */}
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <label className="block text-sm font-semibold text-gray-700" htmlFor="senha-gestor">Nova Senha de Acesso</label>
                        <span className="text-xs text-gray-400">Opcional</span>
                    </div>
                    <div className="relative mb-3 group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5C01] transition-colors text-[22px]">lock</span>
                        <input
                            id="senha-gestor"
                            type={showSenha ? 'text' : 'password'}
                            value={data.senhaGestor}
                            onChange={(e) => onChange('senhaGestor', e.target.value)}
                            placeholder="Deixe em branco para manter a atual"
                            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] transition-all outline-none shadow-sm text-gray-900 placeholder-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowSenha(!showSenha)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[22px]">{showSenha ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>

                    {/* Medidor de força */}
                    {data.senhaGestor && (
                        <>
                            <div className="flex gap-1.5 h-1.5 w-full mb-2">
                                {[1, 2, 3, 4].map((bar) => (
                                    <div
                                        key={bar}
                                        className={`flex-1 rounded-full transition-all duration-300 ${bar <= strength.level ? strength.color : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-xs font-medium ${strength.level === 1 ? 'text-red-500'
                                    : strength.level === 2 ? 'text-yellow-500'
                                        : strength.level === 3 ? 'text-blue-500'
                                            : 'text-green-500'
                                    }`}>
                                    {strength.label}
                                </span>
                                <span className="text-xs text-gray-400">Mínimo de 8 caracteres</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <NavButtons onBack={onBack} />
        </form>
    );
}

// ─── Placeholder Steps ────────────────────────────────────────────────────────
function StepPlaceholder({ title, subtitle, onBack, onNext, isLast = false, isLoading = false }: {
    title: string; subtitle: string; onBack: () => void; onNext: () => void; isLast?: boolean; isLoading?: boolean;
}) {
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onNext(); };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
                <p className="text-gray-500 text-lg">{subtitle}</p>
            </div>
            <div className="flex-grow flex items-center justify-center">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl px-12 py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">construction</span>
                    <p className="text-gray-400 text-sm">Este passo será implementado em breve.</p>
                </div>
            </div>
            <NavButtons onBack={onBack} isLast={isLast} isLoading={isLoading} nextLabel={isLast ? 'Concluir' : 'Próximo Passo'} />
        </form>
    );
}

// ─── Painéis direitos (sidebar) por step ─────────────────────────────────────
function SidebarStep1() {
    return (
        <div className="relative z-10 flex flex-col items-center text-center px-8 gap-5">
            <div className="w-16 h-16 bg-[#FF5C01] rounded-2xl flex items-center justify-center shadow-xl">
                <span className="material-symbols-outlined text-white text-3xl">restaurant_menu</span>
            </div>
            <div>
                <p className="text-white font-bold text-2xl">Comanda Digital</p>
                <p className="text-white/50 text-sm mt-1">Gestão Inteligente para Restaurantes</p>
            </div>
            <div className="mt-2 flex flex-col gap-3 w-full text-left">
                {[
                    { icon: 'receipt_long', text: 'Comandas digitais em tempo real' },
                    { icon: 'groups', text: 'Controle por garçom, bar e cozinha' },
                    { icon: 'bar_chart', text: 'Relatórios e gestão simplificada' },
                ].map(({ icon, text }) => (
                    <div key={icon} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#FF5C01] text-lg">{icon}</span>
                        </div>
                        <span className="text-white/70 text-sm">{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SidebarStep2() {
    return (
        <div className="relative z-10 w-full max-w-sm px-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined">map</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl">Localização</h3>
                        <p className="text-green-100/80 text-sm">Raio de entrega otimizado.</p>
                    </div>
                </div>
                {/* Map placeholder */}
                <div className="bg-black/20 rounded-xl h-40 relative mb-6 border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span className="material-symbols-outlined text-6xl text-white">location_on</span>
                    </div>
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
                    />
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-white/90 italic text-sm leading-relaxed">
                    "Definir a área de entrega correta aumentou nossas vendas em 25% logo no primeiro mês."
                </p>
                <div className="flex items-center gap-3 mt-4 border-t border-white/10 pt-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">JL</div>
                    <div>
                        <div className="text-white font-semibold text-xs">João Lima</div>
                        <div className="text-green-100/70 text-[10px]">Gerente da Pizzaria Bella</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SidebarStep3() {
    return (
        <div className="relative z-10 w-full max-w-sm px-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined">shield</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl">Conta Segura</h3>
                        <p className="text-green-100/80 text-sm">Proteção total dos seus dados.</p>
                    </div>
                </div>
                <div className="space-y-3 mb-6">
                    {[
                        { icon: 'lock', text: 'Acesso protegido por senha' },
                        { icon: 'key', text: 'Recuperação de conta por e-mail' },
                        { icon: 'admin_panel_settings', text: 'Permissões de administrador' },
                        { icon: 'verified_user', text: 'Dados criptografados' },
                    ].map(({ icon, text }) => (
                        <div key={icon} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[#FF5C01] text-base">{icon}</span>
                            </div>
                            <span className="text-white/70 text-sm">{text}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-white/10 pt-5">
                    <p className="text-white/90 italic text-sm leading-relaxed">
                        "Com o acesso centralizado, consigo gerenciar tudo de qualquer lugar com segurança."
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">AM</div>
                        <div>
                            <div className="text-white font-semibold text-xs">Ana Machado</div>
                            <div className="text-green-100/70 text-[10px]">Proprietária do Café Aroma</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── STEP 4: Configuração Operacional ────────────────────────────────────────
interface Step4Props {
    data: FormData;
    onChange: (field: keyof FormData, value: string | boolean) => void;
    onNext: () => void;
    onBack: () => void;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? 'bg-[#FF5C01]' : 'bg-gray-200'
                }`}
        >
            <span
                className={`pointer-events-none block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    );
}

function Step4({ data, onChange, onNext, onBack }: Step4Props) {
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onNext(); };
    const [pendingChange, setPendingChange] = useState<{ field: keyof FormData; value: boolean; isProfileChange: boolean } | null>(null);

    const handleToggle = (field: keyof FormData, v: boolean) => {
        // Se a mudança envolver Delivery ou Consumo Local, a gente mostra o aviso de perfil
        if (field === 'aceitaDelivery' || field === 'aceitaConsumoLocal') {
            setPendingChange({ field, value: v, isProfileChange: true });
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

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow relative">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Configuração Operacional</h1>
                <p className="text-gray-500 text-lg">Defina como seu estabelecimento irá operar para otimizar o fluxo de pedidos.</p>
            </div>

            <div className="space-y-6">
                {/* Delivery */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#FF5C01]/10 text-[#FF5C01] p-3 rounded-xl">
                                <span className="material-symbols-outlined text-2xl">two_wheeler</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Aceita Delivery</h3>
                                <p className="text-sm text-gray-500">Entregas via motoboy próprio ou app</p>
                            </div>
                        </div>
                        <Toggle checked={data.aceitaDelivery} onChange={(v) => handleToggle('aceitaDelivery', v)} />
                    </div>
                    {data.aceitaDelivery && (
                        <div className="p-5 grid grid-cols-2 gap-4 bg-gray-50">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Raio de entrega</label>
                                <div className="relative">
                                    <input
                                        type="number" min="1" max="100"
                                        value={data.raioEntrega}
                                        onChange={(e) => onChange('raioEntrega', e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] pl-4 pr-10 py-2.5 text-sm outline-none shadow-sm"
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-medium">km</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Tempo médio</label>
                                <div className="relative">
                                    <input
                                        type="number" min="10" max="180"
                                        value={data.tempoMedioEntrega}
                                        onChange={(e) => onChange('tempoMedioEntrega', e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] pl-4 pr-10 py-2.5 text-sm outline-none shadow-sm"
                                    />
                                    <span className="absolute right-3 top-2.5 text-gray-400 text-xs font-medium">min</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modalidades conjuntas (em vez da lista antiga que quebrava grid) */}
                <div className="space-y-3 flex-grow">
                    <label className="text-xs font-bold uppercase tracking-wide text-gray-500 block">Modalidades de Serviço</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                            onClick={() => handleToggle('aceitaRetirada', !data.aceitaRetirada)}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:border-[#FF5C01]/40 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${data.aceitaRetirada ? 'bg-[#FF5C01] text-white' : 'bg-[#FF5C01]/10 text-[#FF5C01]'}`}>
                                    <span className="material-symbols-outlined text-xl">shopping_bag</span>
                                </div>
                                <h3 className="font-bold text-sm text-gray-900">Retirada</h3>
                            </div>
                            <Toggle checked={data.aceitaRetirada} onChange={(v) => handleToggle('aceitaRetirada', v)} />
                        </div>
                        <div
                            onClick={() => handleToggle('aceitaConsumoLocal', !data.aceitaConsumoLocal)}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between hover:border-[#FF5C01]/40 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${data.aceitaConsumoLocal ? 'bg-[#FF5C01] text-white' : 'bg-[#FF5C01]/10 text-[#FF5C01]'}`}>
                                    <span className="material-symbols-outlined text-xl">restaurant</span>
                                </div>
                                <h3 className="font-bold text-sm text-gray-900">Consumo Local</h3>
                            </div>
                            <Toggle checked={data.aceitaConsumoLocal} onChange={(v) => handleToggle('aceitaConsumoLocal', v)} />
                        </div>
                    </div>
                </div>

                {/* Horários */}
                <div className="space-y-3 pt-2 border-t border-gray-100 flex-grow">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500 block">Horário de Funcionamento</label>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100 mb-6">
                        {[
                            { icon: 'calendar_today', iconBg: 'bg-blue-100 text-blue-600', label: 'Segunda a Sexta', field: 'horarioSegSex' as const },
                            { icon: 'weekend', iconBg: 'bg-purple-100 text-purple-600', label: 'Sábado e Domingo', field: 'horarioSabDom' as const },
                        ].map(({ icon, iconBg, label, field }) => (
                            <div key={field} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
                                        <span className="material-symbols-outlined text-sm">{icon}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={data[field].split(' - ')[0] || '10:00'}
                                        onChange={(e) => {
                                            const end = data[field].split(' - ')[1] || '23:00';
                                            onChange(field, `${e.target.value} - ${end}`);
                                        }}
                                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#FF5C01]/40 focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none text-center cursor-pointer transition-all"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => {
                                            const hr = i.toString().padStart(2, '0') + ':00';
                                            return <option key={hr} value={hr}>{hr}</option>;
                                        })}
                                    </select>
                                    <span className="text-gray-400 font-medium">às</span>
                                    <select
                                        value={data[field].split(' - ')[1] || '23:00'}
                                        onChange={(e) => {
                                            const start = data[field].split(' - ')[0] || '10:00';
                                            onChange(field, `${start} - ${e.target.value}`);
                                        }}
                                        className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#FF5C01]/40 focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none text-center cursor-pointer transition-all"
                                    >
                                        {Array.from({ length: 24 }).map((_, i) => {
                                            const hr = i.toString().padStart(2, '0') + ':00';
                                            return <option key={hr} value={hr}>{hr}</option>;
                                        })}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* OVERLAY MODAL */}
            {pendingChange && pendingChange.isProfileChange && (
                <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
                    <div className="bg-white rounded-3xl p-8 max-w-[420px] w-full shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5C01]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="w-14 h-14 bg-[#FF5C01]/10 text-[#FF5C01] rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <span className="material-symbols-outlined text-2xl">published_with_changes</span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">
                            Mudança de Perfil Operacional
                        </h3>

                        <p className="text-gray-600 text-[15px] leading-relaxed mb-8 relative z-10">
                            Ao {pendingChange.value ? <strong className="text-green-600">habilitar</strong> : <strong className="text-red-500">desabilitar</strong>} essa chave, o sistema entende que a sua base de negócio deixará de ser {pendingChange.field === 'aceitaDelivery' ? 'exclusivamente Delivery' : 'exclusivamente Física'} e se tornará um perfil diferente, ativando novos recursos e desativando outros.
                            <br /><br />
                            Deseja confirmar a alteração de Perfil?
                        </p>

                        <div className="flex gap-3 relative z-10">
                            <button
                                type="button"
                                onClick={() => setPendingChange(null)}
                                className="flex-1 px-5 py-3.5 border-2 border-gray-100 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-200 focus:ring-2 focus:ring-gray-100 transition-all font-bold text-sm"
                            >
                                Manter como está
                            </button>
                            <button
                                type="button"
                                onClick={confirmChange}
                                className="flex-1 px-5 py-3.5 bg-[#FF5C01] hover:bg-[#e05101] text-white rounded-xl shadow-[0_4px_12px_rgba(255,92,1,0.25)] hover:shadow-[0_6px_16px_rgba(255,92,1,0.3)] transition-all font-bold text-sm transform hover:-translate-y-0.5"
                            >
                                Sim, Atualizar Perfil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-auto">
                <NavButtons onBack={onBack} />
            </div>
        </form>
    );
}

// ─── STEP 5: Termos e Privacidade ─────────────────────────────────────────────
interface Step5Props {
    data: FormData;
    onChange: (field: keyof FormData, value: boolean) => void;
    onNext: () => void;
    onBack: () => void;
    isLoading?: boolean;
}

function Step5({ data, onChange, onNext, onBack, isLoading }: Step5Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.aceitaTermos) { toast.error('Você precisa aceitar os Termos de Uso'); return; }
        if (!data.aceitaPrivacidade) { toast.error('Você precisa aceitar a Política de Privacidade'); return; }
        if (!data.autorizaLgpd) { toast.error('Você precisa autorizar o tratamento de dados (LGPD)'); return; }
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Termos e Privacidade</h1>
                <p className="text-gray-500 text-lg">Leia atentamente nossos termos antes de finalizar.</p>
            </div>

            {/* Texto dos Termos */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6">
                <div className="h-48 overflow-y-auto pr-2 text-sm text-gray-600 leading-relaxed space-y-4 scrollbar-thin">
                    <p className="font-bold text-gray-900 text-base">1. Introdução</p>
                    <p>Bem-vindo à Comanda Digital. Estes Termos de Uso regulam o acesso e utilização da nossa plataforma SaaS. Ao criar uma conta, você concorda com o tratamento de seus dados pessoais conforme descrito em nossa Política de Privacidade.</p>
                    <p className="font-bold text-gray-900 text-base">2. Dados e Privacidade (LGPD)</p>
                    <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), garantimos transparência sobre como coletamos, usamos e protegemos suas informações. Seus dados serão utilizados apenas para fins de prestação de serviço e melhoria da experiência do usuário.</p>
                    <p className="font-bold text-gray-900 text-base">3. Responsabilidades do Usuário</p>
                    <p>O usuário é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorram sob sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.</p>
                    <p className="font-bold text-gray-900 text-base">4. Disposições Finais</p>
                    <p>O uso contínuo de nossos serviços constitui aceitação destes termos. Reservamo-nos o direito de modificar estes termos a qualquer momento, com aviso prévio aos usuários.</p>
                </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 mb-6">
                {[
                    { field: 'aceitaTermos' as const, required: true, label: (<>Li e aceito os <a href="#" className="text-[#FF5C01] font-semibold hover:underline">Termos de Uso</a></>) },
                    { field: 'aceitaPrivacidade' as const, required: true, label: (<>Aceito a <a href="#" className="text-[#FF5C01] font-semibold hover:underline">Política de Privacidade</a></>) },
                    { field: 'autorizaLgpd' as const, required: true, label: 'Autorizo o tratamento de meus dados conforme a LGPD' },
                ].map(({ field, label }) => (
                    <label key={field} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={data[field]}
                            onChange={(e) => onChange(field, e.target.checked)}
                            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#FF5C01] focus:ring-[#FF5C01]/20 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                ))}
                <div className="border-t border-gray-100 pt-3">
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={data.receberNovidades}
                            onChange={(e) => onChange('receberNovidades', e.target.checked)}
                            className="mt-0.5 h-5 w-5 rounded border-gray-300 text-[#FF5C01] focus:ring-[#FF5C01]/20 cursor-pointer"
                        />
                        <span className="text-sm text-gray-500">Desejo receber novidades e promoções por e-mail <span className="text-gray-400">(Opcional)</span></span>
                    </label>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
                <button type="button" onClick={onBack} className="px-6 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors">
                    Voltar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#FF5C01] hover:bg-[#e05101] text-white font-semibold py-3 px-8 rounded-lg shadow-lg shadow-orange-500/20 flex items-center gap-2 group transition-all disabled:opacity-60"
                >
                    {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
                    Finalizar Cadastro
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-xl">arrow_forward</span>
                </button>
            </div>
        </form>
    );
}

// ─── Sidebar Step 4 ───────────────────────────────────────────────────────────
function SidebarStep4() {
    return (
        <div className="relative z-10 w-full max-w-sm px-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined">storefront</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl">Operação Eficiente</h3>
                        <p className="text-green-100/80 text-sm">Configure cada detalhe do seu atendimento.</p>
                    </div>
                </div>
                <div className="space-y-3 mb-6">
                    {[
                        { icon: 'two_wheeler', text: 'Delivery com raio configurável' },
                        { icon: 'shopping_bag', text: 'Retirada no balcão' },
                        { icon: 'restaurant', text: 'Consumo no local' },
                        { icon: 'schedule', text: 'Horários por dia da semana' },
                    ].map(({ icon, text }) => (
                        <div key={icon} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[#FF5C01] text-base">{icon}</span>
                            </div>
                            <span className="text-white/70 text-sm">{text}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-400 text-base mt-0.5">check_circle</span>
                        <p className="text-green-100/90 text-xs leading-relaxed">
                            O horário de funcionamento atualiza automaticamente o status Aberto/Fechado no sistema.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sidebar Step 5 ───────────────────────────────────────────────────────────
function SidebarStep5() {
    return (
        <div className="relative z-10 w-full max-w-sm px-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 ring-1 ring-green-400/20">
                        <span className="material-symbols-outlined text-5xl">verified_user</span>
                    </div>
                </div>
                <h3 className="text-white font-bold text-xl text-center mb-2">Sua conta está segura</h3>
                <p className="text-green-100/70 text-sm text-center mb-6 leading-relaxed">
                    Seguimos rigorosos padrões de segurança e conformidade para proteger os dados do seu restaurante.
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: 'policy', label: 'LGPD', sub: 'Conformidade Total' },
                        { icon: 'lock', label: 'SSL 256-bit', sub: 'Criptografia Ponta a Ponta' },
                        { icon: 'gpp_good', label: 'Verificado', sub: 'Dados Protegidos' },
                        { icon: 'security', label: 'Seguro', sub: 'ISO 27001' },
                    ].map(({ icon, label, sub }) => (
                        <div key={icon} className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                            <span className="material-symbols-outlined text-2xl text-[#FF5C01] mb-2">{icon}</span>
                            <h4 className="font-bold text-white text-xs uppercase tracking-wide">{label}</h4>
                            <p className="text-[10px] text-green-100/60 mt-1">{sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StepSuccess() {
    const router = useRouter();
    return (
        <div className="flex-grow flex items-center justify-center py-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#FF5C01]/10 rounded-full blur-3xl opacity-60 pointer-events-none -z-10"></div>
            <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl opacity-60 pointer-events-none -z-10"></div>

            <div className="max-w-[640px] w-full mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-slate-100 relative overflow-hidden animate-in fade-in duration-500 fly-in-from-bottom-4">
                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-300 via-[#FF5C01] to-orange-300"></div>

                    {/* Celebratory Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center relative">
                            <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
                            <div className="absolute inset-0 border-4 border-green-50 rounded-full scale-110"></div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Tudo pronto!
                        <br />
                        <span className="text-xl md:text-2xl font-semibold text-slate-600 block mt-2">Sua conta foi configurada com sucesso</span>
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                        Bem-vindo ao Comanda Digital. Agora você já pode começar a usar o painel e revolucionar sua operação.
                    </p>

                    {/* Action Card Section */}
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 justify-center text-[#FF5C01] font-bold uppercase tracking-wider text-xs">
                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                Próximos Passos
                            </div>
                            <button onClick={() => router.push('/admin/dashboard')} className="w-full cursor-pointer flex items-center justify-center rounded-lg h-12 px-6 bg-[#FF5C01] hover:bg-[#e05101] text-white text-base font-bold shadow-lg shadow-orange-500/20 transition-all duration-200 transform hover:-translate-y-0.5">
                                <span className="mr-2">Acessar meu Painel</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function CompletarPerfilPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [user, setUser] = useState<any>(null);

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
                    const data = await response.json();
                    setUser(data);

                    const est = data.estabelecimento || {};
                    setFormData(prev => ({
                        ...prev,
                        nomeGestor: data.nome || '',
                        emailGestor: data.email || '',
                        nomeFantasia: est.nome || '',
                        telefoneComercial: est.telefone || '',
                        aceitaConsumoLocal: est.operaLocal || est.operaHospedado || false,
                        aceitaDelivery: est.operaDelivery || false,
                    }));
                } else {
                    localStorage.removeItem('token');
                    router.replace('/auth/login');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const updateField = (field: keyof FormData, value: string | boolean) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const goNext = () => setCurrentStep((s) => Math.min(s + 1, 5));
    const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

    const handleFinish = async () => {
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
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar os dados.');
            }

            toast.success('Perfil configurado com sucesso!');
            setIsSuccess(true);
        } catch (error: any) {
            toast.error(error.message || 'Erro ao finalizar o preenchimento do perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/auth/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#FF5C01] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">

            {/* Header (Layout Boas-Vindas) */}
            <header className="w-full bg-[#fdfdfd] px-8 py-4 flex items-center justify-between shadow-sm border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2 text-[#0B241E]">
                    <div className="w-8 h-8 bg-[#feefe6] rounded-lg flex items-center justify-center text-[#FF5C01] shadow-sm">
                        <span className="material-symbols-outlined text-lg">restaurant</span>
                    </div>
                    <span className="font-bold text-lg tracking-wide font-display text-gray-900">Comanda Digital</span>
                </div>
                <div className="flex items-center gap-6">
                    {user && (
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{user.estabelecimento?.nome || 'Meu Negócio'}</p>
                                <p className="text-xs text-gray-500">{user.nome}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-[#FF5C01]/10 text-[#FF5C01] font-bold flex items-center justify-center text-sm border border-[#FF5C01]/20">
                                {user.nome?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    )}
                    <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Sair
                    </button>
                </div>
            </header>

            {/* Secondary Header - Progress Steps */}
            {!isSuccess && (
                <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
                    <div className="max-w-[1024px] mx-auto w-full px-6 lg:px-10 py-4">
                        <ProgressBar currentStep={currentStep} />
                    </div>
                </div>
            )}

            {/* Content Forms or Success */}
            <main className="max-w-[1024px] mx-auto w-full px-6 lg:px-10 py-10 flex-grow">
                {isSuccess ? (
                    <StepSuccess />
                ) : (
                    <>
                        {currentStep === 1 && <Step1 data={formData} onChange={updateField} onNext={goNext} />}
                        {currentStep === 2 && <Step2 data={formData} onChange={updateField} onNext={goNext} onBack={goBack} />}
                        {currentStep === 3 && (
                            <Step3 data={formData} onChange={updateField} onNext={goNext} onBack={goBack} />
                        )}
                        {currentStep === 4 && (
                            <Step4 data={formData} onChange={updateField} onNext={goNext} onBack={goBack} />
                        )}
                        {currentStep === 5 && (
                            <Step5 data={formData} onChange={updateField} onNext={handleFinish} onBack={goBack} isLoading={isSaving} />
                        )}
                    </>
                )}

                <p className="text-xs text-gray-400 text-center mt-8">
                    © 2025 Comanda Digital. Todos os direitos reservados.
                </p>
            </main>

        </div>
    );
}

