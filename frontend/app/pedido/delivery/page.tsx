'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, MapPin, User, Phone, Mail, Home, X, Loader2, CheckCircle, Truck, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/?$/, '');

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ItemCarrinho {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
}

interface EnderecoSalvo {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  padrao: boolean;
}

interface ClienteSalvo {
  id: string;
  nome: string;
  enderecos: EnderecoSalvo[];
}

type Etapa = 'itens' | 'cliente' | 'endereco' | 'pagamento' | 'confirmacao' | 'sucesso';
type MetodoPagamento = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito';

const METODOS_PAGAMENTO: { id: MetodoPagamento; label: string; descricao: string; icone: string }[] = [
  { id: 'pix',            label: 'PIX',               icone: '📱', descricao: 'Pague com PIX ao receber o pedido' },
  { id: 'dinheiro',       label: 'Dinheiro',           icone: '💵', descricao: 'Pague em dinheiro na entrega' },
  { id: 'cartao_credito', label: 'Cartão de Crédito',  icone: '💳', descricao: 'Máquina de cartão na entrega' },
  { id: 'cartao_debito',  label: 'Cartão de Débito',   icone: '💳', descricao: 'Máquina de cartão na entrega' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

function PedidoDeliveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const estabelecimentoId = searchParams.get('id') || '';
  const taxaEntrega = parseFloat(searchParams.get('taxa') || '0') || 0;

  // Navegação
  const [etapa, setEtapa] = useState<Etapa>('itens');

  // Carrinho
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  // Dados do cliente (formulário)
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  // Lookup de cliente existente
  const [clienteSalvo, setClienteSalvo] = useState<ClienteSalvo | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  // Endereço: selecionado (salvo) OU preenchido no formulário
  const [enderecoSelecionadoId, setEnderecoSelecionadoId] = useState<string | null>(null);
  const [modoNovoEndereco, setModoNovoEndereco] = useState(false);

  // Campos do formulário de endereço
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [referencia, setReferencia] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Pagamento e obs
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento | null>(null);
  const [observacoes, setObservacoes] = useState('');

  // Submit
  const [loading, setLoading] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState<any>(null);

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

  // ─── Helpers ──────────────────────────────────────────────────────────────

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
    if (!telefone.trim() || telefone.replace(/\D/g, '').length < 10) {
      toast.error('Informe um telefone válido');
      return false;
    }
    return true;
  };

  const validarFormEndereco = () => {
    if (!logradouro.trim()) { toast.error('Informe o logradouro'); return false; }
    if (!numero.trim()) { toast.error('Informe o número'); return false; }
    if (!bairro.trim()) { toast.error('Informe o bairro'); return false; }
    if (!cidade.trim()) { toast.error('Informe a cidade'); return false; }
    if (!estado.trim()) { toast.error('Informe o estado'); return false; }
    return true;
  };

  /** Lookup silencioso do cliente pelo telefone */
  const buscarClientePorTelefone = async () => {
    setBuscandoCliente(true);
    try {
      const res = await fetch(`${API_URL}/api/cliente/delivery/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estabelecimentoId,
          telefone: telefone.replace(/\D/g, ''),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const salvo: ClienteSalvo = {
          id: data.cliente.id,
          nome: data.cliente.nome,
          enderecos: data.enderecos || [],
        };
        setClienteSalvo(salvo);
        // Pré-preenche o nome se estava vazio
        if (!nome.trim() && data.cliente.nome) setNome(data.cliente.nome);
        // Pré-seleciona o endereço padrão, se existir
        const padrao = salvo.enderecos.find(e => e.padrao);
        if (padrao) setEnderecoSelecionadoId(padrao.id);
      } else {
        setClienteSalvo(null);
        setEnderecoSelecionadoId(null);
      }
    } catch {
      setClienteSalvo(null);
    } finally {
      setBuscandoCliente(false);
    }
  };

  /** Avançar etapa — centraliza toda a lógica de navegação */
  const avancarEtapa = async () => {
    if (etapa === 'itens') {
      setEtapa('cliente');
    } else if (etapa === 'cliente') {
      if (!validarCliente()) return;
      await buscarClientePorTelefone();
      setEtapa('endereco');
    } else if (etapa === 'endereco') {
      const usandoEnderecoSalvo = enderecoSelecionadoId && !modoNovoEndereco;
      if (!usandoEnderecoSalvo && !validarFormEndereco()) return;
      setEtapa('pagamento');
    } else if (etapa === 'pagamento') {
      if (!metodoPagamento) { toast.error('Selecione uma forma de pagamento'); return; }
      setEtapa('confirmacao');
    }
  };

  // ─── Endereço para exibição na confirmação ─────────────────────────────────

  const enderecoExibicao: EnderecoSalvo | null = (() => {
    if (enderecoSelecionadoId && !modoNovoEndereco && clienteSalvo) {
      return clienteSalvo.enderecos.find(e => e.id === enderecoSelecionadoId) ?? null;
    }
    if (logradouro) {
      return { id: '', cep, logradouro, numero, complemento, bairro, cidade, estado, referencia, padrao: false };
    }
    return null;
  })();

  // ─── Finalizar pedido ──────────────────────────────────────────────────────

  const finalizarPedido = async () => {
    setLoading(true);
    try {
      const usandoEnderecoSalvo = enderecoSelecionadoId && !modoNovoEndereco;
      const body: Record<string, unknown> = {
        estabelecimentoId,
        cliente: { nome, telefone, email: email || undefined },
        itens: carrinho.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
        observacoes: observacoes || undefined,
        taxaEntrega,
        formaPagamento: 'imediato',
        metodoPagamento: metodoPagamento || undefined,
      };
      if (usandoEnderecoSalvo) {
        body.enderecoId = enderecoSelecionadoId;
      } else {
        body.endereco = {
          cep: cep.replace(/\D/g, ''),
          logradouro,
          numero,
          complemento: complemento || undefined,
          bairro,
          cidade,
          estado,
          referencia: referencia || undefined,
        };
      }

      const res = await fetch(`${API_URL}/api/cliente/delivery/pedido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  // ─── Passos do stepper ─────────────────────────────────────────────────────

  const passos: { id: Etapa; label: string }[] = [
    { id: 'itens',       label: 'Itens' },
    { id: 'cliente',     label: 'Você' },
    { id: 'endereco',    label: 'Endereço' },
    { id: 'pagamento',   label: 'Pagamento' },
    { id: 'confirmacao', label: 'Confirmar' },
  ];

  // ─── Tela de sucesso ───────────────────────────────────────────────────────

  if (etapa === 'sucesso') {
    const codigoComanda = pedidoCriado?.comanda?.codigo;
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Pedido realizado!</h1>
        <p className="text-slate-500 mb-2">Seu pedido foi enviado com sucesso.</p>
        {codigoComanda && (
          <p className="text-sm font-medium text-slate-600 mb-6">
            Código da comanda: <span className="font-bold text-[#FF6B00]">{codigoComanda}</span>
          </p>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 w-full max-w-sm mb-6 text-left">
          <div className="flex items-center gap-3 text-slate-700">
            <Truck className="w-5 h-5 text-[#FF6B00]" />
            <span className="text-sm font-semibold">Seu pedido está sendo preparado!</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 ml-8">Em breve um entregador estará a caminho.</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {codigoComanda && (
            <button
              onClick={() => router.push(`/pedido/acompanhar?comanda=${codigoComanda}`)}
              className="px-8 py-3 bg-[#FF6B00] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
            >
              Acompanhar Pedido
            </button>
          )}
          <button
            onClick={() => router.push(`/cardapio?id=${estabelecimentoId}`)}
            className="px-8 py-3 bg-white text-slate-700 font-semibold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  // ─── Layout principal ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              if (etapa === 'itens') router.back();
              else if (etapa === 'cliente') setEtapa('itens');
              else if (etapa === 'endereco') setEtapa('cliente');
              else if (etapa === 'pagamento') setEtapa('endereco');
              else if (etapa === 'confirmacao') setEtapa('pagamento');
            }}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-base font-extrabold text-slate-900">Checkout Delivery</h1>
        </div>

        {/* Stepper */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex items-center gap-1">
            {passos.map((p, i) => {
              const idxAtual = passos.findIndex(x => x.id === etapa);
              const ativo = p.id === etapa;
              const completo = i < idxAtual;
              return (
                <div key={p.id} className="flex items-center gap-1 flex-1">
                  <div className={`flex items-center gap-1.5 flex-1 ${ativo ? 'text-[#FF6B00]' : completo ? 'text-green-500' : 'text-slate-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${ativo ? 'border-[#FF6B00] bg-[#FF6B00] text-white' : completo ? 'border-green-500 bg-green-500 text-white' : 'border-slate-200'}`}>
                      {completo ? '✓' : i + 1}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block truncate">{p.label}</span>
                  </div>
                  {i < passos.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-36">

        {/* ── ITENS ────────────────────────────────────────────────────────── */}
        {etapa === 'itens' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-4">Seu pedido</h2>
            <div className="space-y-3 mb-6">
              {carrinho.map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                    {item.imagemUrl
                      ? <img src={item.imagemUrl} alt={item.nome} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-slate-300 text-2xl">restaurant</span></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.nome}</p>
                    <p className="text-xs text-slate-400">R$ {item.preco.toFixed(2)} × {item.quantidade}</p>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FF6B00]" /> Taxa de entrega
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {taxaEntrega === 0 ? 'Grátis' : `R$ ${taxaEntrega.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-slate-500">Entrega</span>
                <span className="font-semibold">{taxaEntrega === 0 ? 'Grátis' : `R$ ${taxaEntrega.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t pt-3">
                <span>Total</span>
                <span className="text-[#FF6B00]">R$ {totalFinal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* ── CLIENTE ──────────────────────────────────────────────────────── */}
        {etapa === 'cliente' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF6B00]" /> Seus dados
            </h2>
            <p className="text-sm text-slate-400 mb-6">Para identificar seu pedido e histórico de entregas.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Telefone / WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(11) 99999-9999" type="tel"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">E-mail (opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── ENDEREÇO ─────────────────────────────────────────────────────── */}
        {etapa === 'endereco' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B00]" /> Endereço de entrega
            </h2>
            <p className="text-sm text-slate-400 mb-6">Para onde devemos enviar seu pedido?</p>

            {/* Endereços salvos */}
            {clienteSalvo && clienteSalvo.enderecos.length > 0 && !modoNovoEndereco ? (
              <>
                <div className="space-y-3 mb-4">
                  {clienteSalvo.enderecos.map((end) => {
                    const selecionado = enderecoSelecionadoId === end.id;
                    return (
                      <button
                        key={end.id}
                        onClick={() => setEnderecoSelecionadoId(end.id)}
                        className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                          selecionado ? 'border-[#FF6B00] bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <Home className={`w-5 h-5 mt-0.5 flex-shrink-0 ${selecionado ? 'text-[#FF6B00]' : 'text-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${selecionado ? 'text-[#FF6B00]' : 'text-slate-900'}`}>
                            {end.logradouro}, {end.numero}
                            {end.complemento ? `, ${end.complemento}` : ''}
                            {end.padrao && <span className="ml-2 text-xs bg-orange-100 text-[#FF6B00] px-1.5 py-0.5 rounded-full font-semibold">padrão</span>}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{end.bairro} · {end.cidade}/{end.estado}</p>
                          {end.referencia && <p className="text-xs text-slate-400">Ref: {end.referencia}</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          selecionado ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-slate-300'
                        }`}>
                          {selecionado && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => { setModoNovoEndereco(true); setEnderecoSelecionadoId(null); }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Usar outro endereço
                </button>
              </>
            ) : (
              /* Formulário de novo endereço */
              <>
                {clienteSalvo && clienteSalvo.enderecos.length > 0 && (
                  <button
                    onClick={() => { setModoNovoEndereco(false); const padrao = clienteSalvo.enderecos.find(e => e.padrao); setEnderecoSelecionadoId(padrao?.id ?? clienteSalvo.enderecos[0].id); }}
                    className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#FF6B00] hover:underline"
                  >
                    ← Usar endereço salvo
                  </button>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">CEP *</label>
                    <div className="flex gap-2">
                      <input value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep}
                        placeholder="00000-000" maxLength={9}
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                      {buscandoCep && <div className="flex items-center px-3"><Loader2 className="w-5 h-5 animate-spin text-[#FF6B00]" /></div>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Logradouro *</label>
                    <input value={logradouro} onChange={e => setLogradouro(e.target.value)} placeholder="Rua, Avenida..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Número *</label>
                      <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="123"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Complemento</label>
                      <input value={complemento} onChange={e => setComplemento(e.target.value)} placeholder="Apto, Bloco..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bairro *</label>
                    <input value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Nome do bairro"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cidade *</label>
                      <input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Cidade"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Estado *</label>
                      <input value={estado} onChange={e => setEstado(e.target.value)} placeholder="SP" maxLength={2}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Referência</label>
                    <input value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="Próximo ao mercado..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00]" />
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── PAGAMENTO ────────────────────────────────────────────────────── */}
        {etapa === 'pagamento' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">Forma de pagamento</h2>
            <p className="text-sm text-slate-400 mb-6">Você pagará ao receber o pedido.</p>
            <div className="space-y-3">
              {METODOS_PAGAMENTO.map((metodo) => {
                const selecionado = metodoPagamento === metodo.id;
                return (
                  <button
                    key={metodo.id}
                    onClick={() => setMetodoPagamento(metodo.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      selecionado ? 'border-[#FF6B00] bg-orange-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl">{metodo.icone}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${selecionado ? 'text-[#FF6B00]' : 'text-slate-900'}`}>{metodo.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{metodo.descricao}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selecionado ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-slate-300'
                    }`}>
                      {selecionado && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
            {metodoPagamento === 'pix' && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Pagamento via PIX</p>
                  <p className="text-xs text-blue-600 mt-0.5">O entregador apresentará a chave PIX na entrega. Nenhum pagamento antecipado.</p>
                </div>
              </div>
            )}
            {metodoPagamento === 'dinheiro' && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3">
                <span className="text-xl">💵</span>
                <div>
                  <p className="text-sm font-semibold text-green-800">Pagamento em dinheiro</p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Tenha o valor exato ou informe o troco nas observações. Total: <span className="font-bold">R$ {totalFinal.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CONFIRMAÇÃO ──────────────────────────────────────────────────── */}
        {etapa === 'confirmacao' && (
          <>
            <h2 className="text-lg font-extrabold text-slate-900 mb-6">Confirmar pedido</h2>

            {/* Cliente */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
              <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-[#FF6B00]" /><h3 className="font-bold text-sm text-slate-700">Cliente</h3></div>
              <p className="text-sm text-slate-900 font-semibold">{nome}</p>
              <p className="text-xs text-slate-400">{telefone}{email ? ` · ${email}` : ''}</p>
            </div>

            {/* Endereço */}
            {enderecoExibicao && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
                <div className="flex items-center gap-2 mb-2"><Home className="w-4 h-4 text-[#FF6B00]" /><h3 className="font-bold text-sm text-slate-700">Entrega</h3></div>
                <p className="text-sm text-slate-900">{enderecoExibicao.logradouro}, {enderecoExibicao.numero}{enderecoExibicao.complemento ? `, ${enderecoExibicao.complemento}` : ''}</p>
                <p className="text-xs text-slate-400">{enderecoExibicao.bairro} · {enderecoExibicao.cidade}/{enderecoExibicao.estado} · CEP {enderecoExibicao.cep}</p>
                {enderecoExibicao.referencia && <p className="text-xs text-slate-400 mt-0.5">Ref: {enderecoExibicao.referencia}</p>}
              </div>
            )}

            {/* Pagamento */}
            {metodoPagamento && (() => {
              const m = METODOS_PAGAMENTO.find(x => x.id === metodoPagamento)!;
              return (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{m.icone}</span>
                    <h3 className="font-bold text-sm text-slate-700">Pagamento</h3>
                  </div>
                  <p className="text-sm text-slate-900">{m.label}</p>
                  <p className="text-xs text-slate-400">{m.descricao}</p>
                </div>
              );
            })()}

            {/* Itens */}
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
              <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3}
                placeholder="Ex: Sem cebola, troco para R$ 50..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] resize-none" />
            </div>

            {/* Total */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Subtotal</span><span>R$ {total.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm mb-3"><span className="text-slate-500">Taxa de entrega</span><span>{taxaEntrega === 0 ? 'Grátis' : `R$ ${taxaEntrega.toFixed(2)}`}</span></div>
              <div className="flex justify-between font-extrabold text-slate-900 border-t pt-3"><span>Total</span><span className="text-[#FF6B00]">R$ {totalFinal.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </main>

      {/* Footer fixo */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 p-4 pb-6">
        <div className="max-w-2xl mx-auto">
          {etapa !== 'confirmacao' ? (
            <button
              onClick={avancarEtapa}
              disabled={buscandoCliente}
              className="w-full bg-[#FF6B00] hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {buscandoCliente
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
                : <>Continuar <ChevronRight className="w-5 h-5" /></>
              }
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
