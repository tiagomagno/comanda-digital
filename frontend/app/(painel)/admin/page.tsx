'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Download, RefreshCw, Smartphone, QrCode } from 'lucide-react';
import { gestorService } from '@/services/gestor.service';
import { toast } from 'react-hot-toast';

export default function AdminPage() {
    const [mesas, setMesas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [novaMesa, setNovaMesa] = useState({ numero: '', capacidade: 4 });

    const fetchMesas = async () => {
        try {
            const data = await gestorService.listarMesas();
            setMesas(data);
        } catch (error) {
            toast.error('Erro ao carregar mesas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMesas();
    }, []);

    const handleCriarMesa = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await gestorService.criarMesa(novaMesa);
            toast.success('Mesa criada com sucesso');
            setShowModal(false);
            setNovaMesa({ numero: '', capacidade: 4 });
            fetchMesas();
        } catch (error) {
            toast.error('Erro ao criar mesa');
        }
    };

    const handleBaixarQR = async (mesa: any) => {
        try {
            // Em uma implementação real, o backend retornaria o arquivo ou URL
            // Aqui estamos simulando o download se tivermos a URL base64 já no objeto
            if (mesa.qrCodeUrl) {
                const link = document.createElement('a');
                link.href = mesa.qrCodeUrl;
                link.download = `mesa-${mesa.numero}-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const blob = await gestorService.baixarQRCode(mesa.id);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `mesa-${mesa.numero}-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            toast.error('Erro ao baixar QR Code');
        }
    };

    const handleRegenerarQR = async (id: string) => {
        if (!confirm('Regenerar o QR Code invalidará o anterior. Continuar?')) return;
        try {
            await gestorService.regenerarQRCode(id);
            toast.success('QR Code regenerado');
            fetchMesas();
        } catch (error) {
            toast.error('Erro ao regenerar QR Code');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Administração
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Nova Mesa
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Smartphone className="w-6 h-6" />
                    Gerenciamento de Mesas e QR Codes
                </h2>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {mesas.map((mesa) => (
                            <div key={mesa.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                                        {mesa.numero}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Mesa {mesa.numero}</h3>
                                    <p className="text-gray-500 text-sm mb-4">Capacidade: {mesa.capacidade} pessoas</p>

                                    {mesa.qrCodeUrl ? (
                                        <div className="bg-gray-50 p-2 rounded-lg mb-4 inline-block">
                                            <img src={mesa.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                                        </div>
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center text-gray-400">
                                            <QrCode className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between">
                                    <button
                                        onClick={() => handleRegenerarQR(mesa.id)}
                                        className="text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-white transition-colors"
                                        title="Regenerar QR"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleBaixarQR(mesa)}
                                        className="text-gray-600 hover:text-green-600 p-2 rounded-lg hover:bg-white transition-colors"
                                        title="Baixar QR"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Nova Mesa */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Nova Mesa</h3>
                        <form onSubmit={handleCriarMesa}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                                    <input
                                        type="text"
                                        required
                                        value={novaMesa.numero}
                                        onChange={e => setNovaMesa({ ...novaMesa, numero: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: 5, A1, VIP-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={novaMesa.capacidade}
                                        onChange={e => setNovaMesa({ ...novaMesa, capacidade: parseInt(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
