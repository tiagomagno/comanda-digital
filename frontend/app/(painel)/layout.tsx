'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PainelSidebar from '@/components/PainelSidebar';
import Header from '@/components/Header';

export default function PainelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [userName, setUserName] = useState('Gestor');
    const [userRole, setUserRole] = useState('Painel');
    const [needsConfig, setNeedsConfig] = useState(false);
    const [isDeliveryOnly, setIsDeliveryOnly] = useState(false);

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
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.nome) {
                        // Pega o primeiro nome
                        setUserName(data.nome.split(' ')[0]);
                    }
                    // ── Verificação completa: todos os campos obrigatórios do formulário ──
                    // Os dados podem vir das colunas diretas do banco OU do JSON `configuracoes`
                    // (salvo via endpoint /api/auth/me/estabelecimento)
                    const est = data.estabelecimento;
                    let cfg: any = {};
                    try {
                        cfg = typeof est?.configuracoes === 'string' ? JSON.parse(est.configuracoes) : (est?.configuracoes || {});
                    } catch (e) {
                        cfg = {};
                    }
                    
                    const aceitaDelivery = cfg.aceitaDelivery ?? (est?.operaDelivery || false);
                    const aceitaConsumoLocal = cfg.aceitaConsumoLocal ?? (est?.operaLocal || est?.operaHospedado || false);
                    
                    if (aceitaDelivery && !aceitaConsumoLocal) {
                        setIsDeliveryOnly(true);
                    }

                    // Exibe nome do estabelecimento (nomeFantasia em configuracoes ou nome no banco)
                    const nomeExibicao = cfg.nomeFantasia || est?.nome || '';
                    if (nomeExibicao) setUserRole(nomeExibicao);

                    // ── Campos obrigatórios (espelham os campos required do formulário) ──
                    const str = (v: any) => !!(v && String(v).trim() !== '');

                    // Dados do Negócio
                    const temNomeFantasia = str(cfg.nomeFantasia) || str(est?.nome);
                    // Retirado temCnpj da checagem obrigatória pois o form não tem required

                    // Endereço e Contato
                    const temCep = str(est?.cep) || str(cfg.cep);
                    const temLogradouro = str(cfg.logradouro);
                    const temNumero = str(cfg.numero);
                    const temBairro = str(cfg.bairro);
                    const temCidade = str(est?.cidade) || str(cfg.cidade);
                    const temEstado = str(est?.estado) || str(cfg.estado);
                    const temTelefone = str(est?.telefone) || str(cfg.telefoneComercial) || str(cfg.telefone);

                    const isFullyConfigured =
                        temNomeFantasia &&
                        temCep &&
                        temLogradouro &&
                        temNumero &&
                        temBairro &&
                        temCidade &&
                        temEstado &&
                        temTelefone;

                    if (!isFullyConfigured) {
                        setNeedsConfig(true);
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar dados do usuário no header do painel:', error);
            }
        };

        fetchUser();
    }, [router]);

    return (
        <div className="min-h-screen flex bg-gray-50">
            <PainelSidebar isDeliveryOnly={isDeliveryOnly} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header userName={userName} userRole={userRole} />

                {needsConfig && (
                    <div className="bg-[#FF5C01]/10 border-b border-[#FF5C01]/20 px-6 py-3 flex items-center justify-between gap-4 relative z-10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FF5C01]/20 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[#FF5C01] text-sm">warning</span>
                            </div>
                            <p className="text-sm font-medium text-[#FF5C01] mb-0">
                                Sua conta de estabelecimento ainda não está configurada por completo.
                            </p>
                        </div>
                        <a
                            href="/boas-vindas/completar-perfil"
                            className="shrink-0 bg-[#FF5C01] hover:bg-[#e05101] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors"
                        >
                            Completar Perfil
                        </a>
                    </div>
                )}

                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
