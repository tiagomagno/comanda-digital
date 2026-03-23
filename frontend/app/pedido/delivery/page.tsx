'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, MapPin, User, Phone, Mail, Home, X, Loader2, CheckCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

interface ItemCarrinho {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
}

type Etapa = 'itens' | 'cliente' | 'endereco' | 'confirmacao' | 'sucesso';

function PedidoDeliveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estabelecimentoId = searchParams.get('id') || '';

  const [etapa, setEtapa] = useState<Etapa>('itens');
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState<any>(null);
  const [taxaEntrega, setTaxaEntrega] = useState(0);

  // Dados do cliente
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Endereço
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [referencia, setReferencia] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Observações
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    const salvo = localStorage.getItem('carrinho');
    if (salvo) {
      setCarrinho(JSON.parse(salvo));
    } else {
      router.back();
    }
  }, []);

  const total = carrinho.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const totalFinal = total + taxaEntrega;

  const buscarCep = async () => {
    const c = cep.replace(/\D/g, '');
    if (c.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://brasilapi.com.br/api/cep/v1/${c}`);
      if (r.ok) {
        const d = await r.json();
        setLogradouro(d.street || '');
        setBairro(d.neighborhood || '');
        setCidade(d.city || '');
        setEstado(d.state || '');
      }
    } catch { /* ignora */ } finally {
      setBuscandoCep(false);
    }
  };

  const validarCliente = () => {
    if (!nome.trim()) { toast.error('Informe seu nome'); return false; }
    if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) { toast.error('Informe um telefone válido'); return false; }
    return true;
  };

  const validarEndereco = () => {
    if (!logradouro.trim()) { toast.error('Informe o logradouro'); return false; }
    if (!numero.trim()) { toast.error('Informe o número'); return false; }
    if (!bairro.trim()) { toast.error('Informe o bairro'); return false; }
    if (!cidade.trim()) { toast.error('Informe a cidade'); return false; }
    if (!estado.trim()) { toast.error('Informe o estado'); return false; }
    return true;
  };

  const finalizarPedido = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cliente/delivery/pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estabelecimentoId,
          cliente: { nome, telefone, email: email || undefined },
          endereco: { cep: cep.replace(/\D/g, ''), logradouro, numero, complemento: complemento || undefined, bairro, cidade, estado, referencia: referencia || undefined },
          itens: carrinho.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
          observacoes: observacoes || undefined,
          taxaEntrega,
          formaPagamento: 'imediato',
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao criar pedido');
      }
      const data = await res.json();
      setPedidoCriado(data);
      localStorage.removeItem('carrinho');
      setEtapa('sucesso');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  const passos: { id: Etapa; label: string }[] = [
    { id: 'itens', label: 'Itens' },
    { id: 'cliente', label: 'Você' },
    { id: 'endereco', label: 'Endereço' },
    { id: 'confirmacao', label: 'Confirmar' },
  ];

  if (etapa === 'sucesso') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Pedido realizado!</h1>
        <p className="text-slate-500 mb-2">Seu pedido foi enviado com sucesso.</p>
        {pedidoCriado?.comanda?.codigo && (
          <p className="text-sm font-medium text-slate-600 mb-6">
            Código da comanda: <span className="font-bold text-[#FF6B00]">{pedidoCriado.comanda.codigo}</span>
          </p>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 w-full max-w-sm mb-6 text-left">
          <div className="flex items-center gap-3 text-slate-700">
            <Truck className="w-5 h-5 text-[#FF6B00]" />
            <span className="text-sm font-semibold">Seu pedido está sendo preparado!</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 ml-8">
            Em breve um entregador estará a caminho.
          </p>
        </div>
        <button
          onClick={() => router.push(`/cardapio?id=${estabelecimentoId}`)}
          className="px-8 py-3 bg-[#FF6B00] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
        >
          Voltar ao Cardápio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => etapa === 'itens' ? router.back() : setEtapa(etapa === 'cliente' ? 'itens' : etapa === 'endereco' ? 'cliente' : 'endereco')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900">Checkout Delivery</h1>
          </div>
        </div>

        {/* Steps */}
        {(etapa as string) !== 'sucesso' && (
          <div className="max-w-2xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-2">
              {passos.map((p, i) => {
                const idxAtual = passos.findIndex(x => x.id === etapa);
                const ativo = p.id === etapa;
                const completo = i < idxAtual;
                return (
                  <div key={p.id} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-1.5 flex-1 ${ativo ? 'text-[#FF6B00]' : completo ? 'text-green-500' : 'text-slate-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${ativo ? 'border-[#FF6B00] bg-[#FF6B00] text-white' : completo ? 'border-green-500 bg-green-500 text-white' : 'border-slate-200'}`}>
                        {completo ? '✓' : i + 1}
                      </div>
                      <span className="text-xs font-semibold hidden sm:block">{p.label}</span>
                    </div>
                    {i < passos.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-36">

        {/* ETAPA: ITENS */}
        {etapa === 'itens' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">Seu pedido</h2>
            <div className="space-y-3 mb-6">
              {carrinho.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                    {item.imagemUrl ? <img src={item.imagemUrl} alt={item.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-2xl">restaurant</span></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.nome}</p>
                    <p className="text-xs text-slate-400">R$ {item.preco.toFixed(2)} × {item.quantidade}</p>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Taxa de entrega */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#FF6B00]" /> Taxa de entrega (R$)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={taxaEntrega}
                onChange={e => setTaxaEntrega(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                placeholder="0,00"
              />
              <p className="text-xs text-slate-400 mt-1">Informe a taxa de entrega para a região</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Entrega</span>
                <span className="font-semibold">R$ {taxaEntrega.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t pt-3">
                <span>Total</span>
                <span className="text-[#FF6B00]">R$ {totalFinal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* ETAPA: CLIENTE */}
        {etapa === 'cliente' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2"><User className="w-5 h-5 text-[#FF6B00]" /> Seus dados</h2>
            <p className="text-sm text-slate-400 mb-6">Para identificar seu pedido e histórico de entregas.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telefone / WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" type="tel" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail (opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ETAPA: ENDEREÇO */}
        {etapa === 'endereco' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#FF6B00]" /> Endereço de entrega</h2>
            <p className="text-sm text-slate-400 mb-6">Para onde devemos enviar seu pedido?</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CEP *</label>
                <div className="flex gap-2">
                  <input value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep} placeholder="00000-000" maxLength={9} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                  {buscandoCep && <div className="flex items-center px-3"><Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" /></div>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logradouro *</label>
                <input value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Rua, Avenida..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número *</label>
                  <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Complemento</label>
                  <input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, Bloco..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bairro *</label>
                <input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Nome do bairro" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cidade *</label>
                  <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado *</label>
                  <input value={estado} onChange={e => setEstado(e.target.value)} placeholder="SP" maxLength={2} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Referência</label>
                <input value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="Próximo ao mercado..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
              </div>
            </div>
          </>
        )}

        {/* ETAPA: CONFIRMAÇÃO */}
        {etapa === 'confirmacao' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-6">Confirmar pedido</h2>

            {/* Resumo cliente */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
              <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-[#FF6B00]" /><h3 className="font-bold text-sm text-slate-700">Cliente</h3></div>
              <p className="text-sm text-slate-900 font-semibold">{nome}</p>
              <p className="text-xs text-slate-400">{telefone}{email ? ` · ${email}` : ''}</p>
            </div>

            {/* Resumo endereço */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
              <div className="flex items-center gap-2 mb-3"><Home className="w-4 h-4 text-[#FF6B00]" /><h3 className="font-bold text-sm text-slate-700">Entrega</h3></div>
              <p className="text-sm text-slate-900">{logradouro}, {numero}{complemento ? `, ${complemento}` : ''}</p>
              <p className="text-xs text-slate-400">{bairro} · {cidade}/{estado} · CEP {cep}</p>
              {referencia && <p className="text-xs text-slate-400 mt-0.5">Ref: {referencia}</p>}
            </div>

            {/* Resumo itens */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-700 mb-3">Itens ({carrinho.length})</h3>
              <div className="space-y-1.5">
                {carrinho.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.quantidade}× {item.nome}</span>
                    <span className="font-semibold text-slate-900">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Observações do pedido</label>
              <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} placeholder="Ex: Sem cebola, troco para R$ 50..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none" />
            </div>

            {/* Total */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Subtotal</span><span>R$ {total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-3"><span className="text-slate-500">Taxa de entrega</span><span>R$ {taxaEntrega.toFixed(2)}</span></div>
              <div className="flex justify-between font-extrabold text-slate-900 border-t pt-3"><span>Total</span><span className="text-[#FF6B00]">R$ {totalFinal.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </main>

      {/* Footer sticky com botão de ação */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 p-4 pb-6">
        <div className="max-w-2xl mx-auto">
          {etapa !== 'confirmacao' ? (
            <button
              onClick={() => {
                if (etapa === 'itens') setEtapa('cliente');
                else if (etapa === 'cliente') { if (validarCliente()) setEtapa('endereco'); }
                else if (etapa === 'endereco') { if (validarEndereco()) setEtapa('confirmacao'); }
              }}
              className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-base"
            >
              Continuar <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={finalizarPedido}
              disabled={loading}
              className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <><CheckCircle className="w-5 h-5" /> Confirmar Pedido</>}
            </button>
          )}
          {etapa === 'confirmacao' && (
            <p className="text-center text-xs text-slate-400 mt-3">Ao confirmar você aceita os termos de uso do estabelecimento.</p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function PedidoDeliveryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" /></div>}>
      <PedidoDeliveryContent />
    </Suspense>
  );
}
