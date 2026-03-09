'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QrCode, Camera, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EscanearMesaPage() {
    const router = useRouter();
    const params = useParams();
    const codigo = params.codigo as string;

    const [loading, setLoading] = useState(false);
    const [mesaManual, setMesaManual] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    useEffect(() => {
        // Verificar se a comanda existe no localStorage
        const comandaCodigo = localStorage.getItem('comandaCodigo');
        if (!comandaCodigo || comandaCodigo !== codigo) {
            alert('Comanda não encontrada. Por favor, crie uma nova comanda.');
            router.push('/comanda/nova');
        }
    }, [codigo, router]);

    const handleQRCodeScan = () => {
        // TODO: Implementar scanner de QR Code usando biblioteca
        // Por enquanto, vamos simular com input manual
        setShowManualInput(true);
    };

    const handleAssociarMesa = async () => {
        if (!mesaManual.trim()) {
            alert('Por favor, informe o número da mesa');
            return;
        }

        setLoading(true);

        try {
            const comandaId = localStorage.getItem('comandaId');

            const response = await fetch(`http://localhost:3001/api/comandas/${comandaId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mesa: mesaManual,
                }),
            });

            if (response.ok) {
                // Salvar mesa no localStorage
                localStorage.setItem('mesa', mesaManual);

                // Redirecionar para o cardápio
                router.push(`/cardapio?comanda=${codigo}`);
            } else {
                alert('Erro ao associar mesa');
            }
        } catch (error) {
            alert('Erro ao associar mesa');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePularMesa = () => {
        // Permitir continuar sem mesa
        router.push(`/cardapio?comanda=${codigo}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <QrCode className="w-10 h-10 text-blue-600" />
                        Escanear Mesa
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Comanda: <span className="font-semibold text-blue-600">{codigo}</span>
                    </p>
                </div>

                {/* Conteúdo */}
                <div className="max-w-md mx-auto">
                    {!showManualInput ? (
                        <>
                            {/* Scanner QR Code */}
                            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                <div className="w-48 h-48 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-24 h-24 text-gray-400" />
                                </div>

                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Escaneie o QR Code
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Aponte a câmera para o QR Code da sua mesa
                                </p>

                                <button
                                    onClick={handleQRCodeScan}
                                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Camera className="w-5 h-5" />
                                    Abrir Câmera
                                </button>

                                <div className="mt-4">
                                    <button
                                        onClick={() => setShowManualInput(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Ou digite o número da mesa manualmente
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Input Manual */}
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                                    Número da Mesa
                                </h2>
                                <p className="text-gray-600 mb-6 text-center">
                                    Digite o número da sua mesa
                                </p>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={mesaManual}
                                        onChange={(e) => setMesaManual(e.target.value)}
                                        placeholder="Ex: 10"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold"
                                        autoFocus
                                    />

                                    <button
                                        onClick={handleAssociarMesa}
                                        disabled={loading || !mesaManual.trim()}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Associando...
                                            </>
                                        ) : (
                                            <>
                                                Confirmar Mesa
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setShowManualInput(false)}
                                        className="w-full text-gray-600 hover:text-gray-700 text-sm font-medium"
                                    >
                                        Voltar para scanner
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Opção de pular */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-1">
                                    Não está em uma mesa?
                                </h3>
                                <p className="text-sm text-yellow-800 mb-3">
                                    Você pode continuar sem associar uma mesa, mas recomendamos informar para facilitar a entrega.
                                </p>
                                <button
                                    onClick={handlePularMesa}
                                    className="text-sm font-medium text-yellow-700 hover:text-yellow-800 underline"
                                >
                                    Continuar sem mesa →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Informações */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            💡 Dica
                        </h3>
                        <p className="text-sm text-blue-800">
                            O QR Code da mesa geralmente está colado na mesa ou no cardápio físico.
                            Se não encontrar, você pode digitar o número manualmente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
