'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clienteService } from '@/services/cliente.service';
import { toast } from 'react-hot-toast';
import { QrCode, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

export default function CheckInPage() {
    const params = useParams();
    const router = useRouter();
    const [mesaInfo, setMesaInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nome: '',
        telefone: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkMesa = async () => {
            try {
                const data = await clienteService.escanearMesa(
                    params.estabelecimentoId as string,
                    params.mesaId as string
                );
                setMesaInfo(data);

                // Se já tiver comanda salva localmente para essa mesa, redireciona
                const savedComanda = localStorage.getItem('comanda_ativa');
                if (savedComanda) {
                    const comanda = JSON.parse(savedComanda);
                    // Opcional: validar se a comanda ainda é válida
                    // router.push(`/cliente/comanda/${comanda.codigo}`);
                }
            } catch (error) {
                toast.error('Erro ao ler QR Code da mesa');
            } finally {
                setLoading(false);
            }
        };

        if (params.estabelecimentoId && params.mesaId) {
            checkMesa();
        }
    }, [params]);

    const handleCriarComanda = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nome || !formData.telefone) return;

        setSubmitting(true);
        try {
            const novaComanda = await clienteService.criarComanda({
                estabelecimentoId: params.estabelecimentoId,
                mesaId: params.mesaId,
                tipoComanda: 'mesa',
                nomeCliente: formData.nome,
                telefoneCliente: formData.telefone,
                formaPagamento: 'final' // ou 'imediato'
            });

            // Salvar localmente
            localStorage.setItem('comanda_ativa', JSON.stringify(novaComanda));

            toast.success('Bem-vindo!');
            router.push(`/cliente/comanda/${novaComanda.codigo}`);
        } catch (error) {
            toast.error('Erro ao iniciar atendimento');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
        );
    }

    if (!mesaInfo) return <div className="p-8 text-center text-gray-500">Mesa não encontrada</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <QrCode className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Bem-vindo ao {mesaInfo.estabelecimento.nome}
                </h2>
                <p className="mt-2 text-center text-xl text-gray-600">
                    Você está na <span className="font-bold text-gray-900">Mesa {mesaInfo.mesa.numero}</span>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
                    {mesaInfo.temComandaAtiva ? (
                        <div className="text-center">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-yellow-800 font-medium">
                                    Já existe uma comanda aberta nesta mesa.
                                </p>
                                <p className="text-yellow-600 text-sm mt-1">
                                    Cliente: {mesaInfo.comandaAtiva?.nomeCliente}
                                </p>
                            </div>
                            <button
                                onClick={() => router.push(`/cliente/comanda/${mesaInfo.comandaAtiva.codigo}`)} // Em teoria precisaria entrar no grupo, mas vamos simplificar
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Ver Cardápio
                            </button>
                        </div>
                    ) : (
                        <form className="mb-0 space-y-6" onSubmit={handleCriarComanda}>
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Seu Nome</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="nome"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                        placeholder="Ex: João Silva"
                                        value={formData.nome}
                                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">Celular (WhatsApp)</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="telefone"
                                        required
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
                                        placeholder="(11) 99999-9999"
                                        value={formData.telefone}
                                        onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all gap-2 items-center"
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin h-5 w-5" />
                                    ) : (
                                        <>
                                            Abrir Comanda <ArrowRight className="h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
