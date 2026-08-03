'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, CreditCard, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { config } from '@/lib/config';

interface CredencialGateway {
    id: string;
    provedor: string;
    publicKey: string | null;
    temSecretKey: boolean;
    temWebhookSecret: boolean;
    ativo: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? 'bg-[#FF5C01]' : 'bg-gray-200'}`}>
            <span className={`pointer-events-none block h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    );
}

export default function PagamentosPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [showWebhookSecret, setShowWebhookSecret] = useState(false);

    const [credencialAtual, setCredencialAtual] = useState<CredencialGateway | null>(null);
    const [publicKey, setPublicKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [ativo, setAtivo] = useState(true);

    const webhookUrl = `${config.apiUrl}/transacoes/webhook/mercadopago`;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/auth/login');
            return;
        }
        carregarCredenciais(token);
    }, [router]);

    const carregarCredenciais = async (token: string) => {
        try {
            const response = await fetch(`${config.apiUrl}/gateways/meus-gateways`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                router.replace('/auth/login');
                return;
            }

            if (response.ok) {
                const credenciais: CredencialGateway[] = await response.json();
                const mp = credenciais.find((c) => c.provedor === 'mercadopago') || null;
                setCredencialAtual(mp);
                if (mp) {
                    setAtivo(mp.ativo);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar credenciais de gateway:', error);
            toast.error('Erro ao carregar configurações de pagamento');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!publicKey.trim() || (!credencialAtual?.temSecretKey && !secretKey.trim())) {
            toast.error('Preencha a Public Key e a Access Token (Secret Key)');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiUrl}/gateways/salvar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    provedor: 'mercadopago',
                    publicKey: publicKey.trim(),
                    ...(secretKey.trim() ? { secretKey: secretKey.trim() } : {}),
                    ...(webhookSecret.trim() ? { webhookSecret: webhookSecret.trim() } : {}),
                    ativo,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || 'Erro ao salvar credenciais');
            }

            toast.success('Credenciais do Mercado Pago salvas com sucesso!');
            setSecretKey('');
            setWebhookSecret('');
            const tk = localStorage.getItem('token');
            if (tk) await carregarCredenciais(tk);
        } catch (error: any) {
            toast.error(error.message || 'Erro ao salvar credenciais');
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
                <p className="text-gray-500 mt-1">
                    Configure o gateway de pagamento para que seus clientes paguem os pedidos diretamente pelo cardápio digital.
                    O dinheiro cai direto na sua conta — a Dine não intermedeia o pagamento.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#FF5C01]/10 text-[#FF5C01] p-3 rounded-xl">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Mercado Pago</h2>
                            <p className="text-sm text-gray-500">
                                {credencialAtual?.temSecretKey ? 'Credenciais configuradas' : 'Nenhuma credencial configurada ainda'}
                            </p>
                        </div>
                    </div>
                    <Toggle checked={ativo} onChange={setAtivo} />
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Public Key</label>
                        <input
                            type="text"
                            value={publicKey}
                            onChange={(e) => setPublicKey(e.target.value)}
                            placeholder={credencialAtual?.publicKey || 'APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Access Token (Secret Key) {credencialAtual?.temSecretKey && <span className="text-xs font-normal text-gray-400">— já configurado, deixe em branco para manter</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showSecretKey ? 'text' : 'password'}
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                placeholder={credencialAtual?.temSecretKey ? '••••••••••••••••' : 'APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'}
                                className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all font-mono text-sm"
                            />
                            <button type="button" onClick={() => setShowSecretKey(!showSecretKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Webhook Secret (Opcional) {credencialAtual?.temWebhookSecret && <span className="text-xs font-normal text-gray-400">— já configurado, deixe em branco para manter</span>}
                        </label>
                        <div className="relative">
                            <input
                                type={showWebhookSecret ? 'text' : 'password'}
                                value={webhookSecret}
                                onChange={(e) => setWebhookSecret(e.target.value)}
                                placeholder="••••••••••••••••"
                                className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF5C01]/20 focus:border-[#FF5C01] outline-none transition-all font-mono text-sm"
                            />
                            <button type="button" onClick={() => setShowWebhookSecret(!showWebhookSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold mb-1">Onde encontrar essas chaves?</p>
                            <p>No painel do Mercado Pago, em <span className="font-mono">Suas integrações → Credenciais de produção</span>. Configure também a URL de notificação (webhook) abaixo lá no Mercado Pago:</p>
                            <p className="mt-2 font-mono text-xs bg-white border border-blue-100 rounded-lg px-3 py-2 break-all">{webhookUrl}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#FF5C01] hover:bg-[#e05101] text-white font-bold py-2.5 px-6 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        Salvar Credenciais
                    </button>
                </div>
            </div>
        </div>
    );
}
