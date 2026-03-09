'use client';

import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';

export default function MesaQRCodePage() {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [mesaNumero] = useState('10'); // Número da mesa (pode ser dinâmico)

    useEffect(() => {
        // URL que o QR Code vai apontar
        const url = `${window.location.origin}/comanda/nova?mesa=${mesaNumero}`;

        // Gerar QR Code usando API pública
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
        setQrCodeUrl(qrApiUrl);
    }, [mesaNumero]);

    const comandaUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/comanda/nova?mesa=${mesaNumero}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card Principal */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <QrCode className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Mesa {mesaNumero}
                        </h1>
                        <p className="text-gray-600">
                            Bar do Zé
                        </p>
                    </div>

                    {/* QR Code */}
                    <div className="bg-white p-6 rounded-2xl border-4 border-purple-200 mb-6">
                        {qrCodeUrl ? (
                            <img
                                src={qrCodeUrl}
                                alt="QR Code da Mesa"
                                className="w-full h-auto"
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        )}
                    </div>

                    {/* Instruções */}
                    <div className="space-y-4">
                        <div className="bg-purple-50 rounded-xl p-4">
                            <h3 className="font-bold text-purple-900 mb-2">
                                📱 Como usar:
                            </h3>
                            <ol className="text-sm text-purple-800 text-left space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">1.</span>
                                    <span>Abra a câmera do seu celular</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">2.</span>
                                    <span>Aponte para o QR Code</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">3.</span>
                                    <span>Toque na notificação que aparecer</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-bold">4.</span>
                                    <span>Faça seu pedido!</span>
                                </li>
                            </ol>
                        </div>

                        {/* Link direto para teste */}
                        <div className="pt-4 border-t">
                            <p className="text-xs text-gray-500 mb-2">Ou clique aqui para testar:</p>
                            <a
                                href={comandaUrl}
                                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Abrir Cardápio
                            </a>
                        </div>
                    </div>
                </div>

                {/* Info adicional */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        💡 Este QR Code é exclusivo da Mesa {mesaNumero}
                    </p>
                </div>
            </div>
        </div>
    );
}
