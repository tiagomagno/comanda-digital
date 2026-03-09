# 🚀 COMO COMPLETAR A INTEGRAÇÃO DO PAYMENTCHOICE

## 📝 Arquivo a Editar

`frontend/app/comanda/nova/page.tsx`

---

## 1️⃣ Adicionar Import

**No topo do arquivo, após os outros imports:**

```typescript
import PaymentChoice from '@/components/PaymentChoice';
```

---

## 2️⃣ Atualizar o Render

**Substituir a seção do formulário (linhas 98-165) por:**

```typescript
{/* Formulário */}
<div className="max-w-md mx-auto">
    <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Step: Dados do Cliente */}
        {step === 'dados' && (
            <form onSubmit={handleContinuarParaPagamento} className="space-y-6">
                {/* Nome */}
                <div>
                    <label
                        htmlFor="nome"
                        className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Nome *
                    </label>
                    <input
                        type="text"
                        id="nome"
                        required
                        value={formData.nomeCliente}
                        onChange={(e) =>
                            setFormData({ ...formData, nomeCliente: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome"
                    />
                </div>

                {/* Telefone */}
                <div>
                    <label
                        htmlFor="telefone"
                        className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Telefone *
                    </label>
                    <input
                        type="tel"
                        id="telefone"
                        required
                        value={formData.telefoneCliente}
                        onChange={(e) =>
                            setFormData({ ...formData, telefoneCliente: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                    />
                </div>

                {/* Botão */}
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <QrCode className="w-5 h-5" />
                    Continuar
                </button>
            </form>
        )}

        {/* Step: Escolha de Pagamento */}
        {step === 'pagamento' && (
            <div>
                <button
                    onClick={() => setStep('dados')}
                    className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
                
                <PaymentChoice
                    onSelect={handleSelecionarPagamento}
                    loading={loading}
                />
            </div>
        )}
    </div>
```

---

## 3️⃣ Adicionar Funções

**Adicionar após a linha 19 (após o useState):**

```typescript
const handleContinuarParaPagamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nomeCliente && formData.telefoneCliente) {
        setStep('pagamento');
    }
};

const handleSelecionarPagamento = (formaPagamento: 'imediato' | 'final') => {
    setFormData({ ...formData, formaPagamento });
    handleSubmit(formaPagamento);
};
```

---

## 4️⃣ Atualizar handleSubmit

**Substituir a função handleSubmit existente (linhas 20-75) por:**

```typescript
const handleSubmit = async (formaPagamento: 'imediato' | 'final') => {
    setLoading(true);

    console.log('Iniciando criação de comanda...', { ...formData, formaPagamento });

    try {
        console.log('Fazendo requisição para:', 'http://localhost:3001/api/comandas');

        const response = await fetch('http://localhost:3001/api/comandas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nomeCliente: formData.nomeCliente,
                telefoneCliente: formData.telefoneCliente,
                formaPagamento,
                estabelecimentoId: 'estab-seed-001', // Bar do Zé
            }),
        });

        console.log('Resposta recebida:', response.status, response.statusText);

        const data = await response.json();
        console.log('Dados da resposta:', data);

        if (response.ok) {
            console.log('Comanda criada com sucesso!', data);

            toast.success(`Comanda criada! Forma de pagamento: ${formaPagamento === 'imediato' ? 'Pagar Agora' : 'Pagar no Final'}`);

            // Salvar código da comanda no localStorage
            localStorage.setItem('comandaCodigo', data.codigo);
            localStorage.setItem('comandaId', data.id);
            localStorage.setItem('formaPagamento', formaPagamento);

            // Se veio da mesa (QR Code), salvar mesa e ir direto para cardápio
            if (mesaUrl) {
                localStorage.setItem('mesa', mesaUrl);
                console.log('Redirecionando para cardápio (mesa:', mesaUrl, ')');
                router.push(`/cardapio?comanda=${data.codigo}`);
            } else {
                // Senão, ir para página de escanear mesa
                console.log('Redirecionando para:', `/comanda/${data.codigo}/mesa`);
                router.push(`/comanda/${data.codigo}/mesa`);
            }
        } else {
            console.error('Erro na resposta:', data);
            toast.error(data.error || 'Erro ao criar comanda');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao conectar com o servidor');
    } finally {
        console.log('Finalizando...');
        setLoading(false);
    }
};
```

---

## 5️⃣ Atualizar Informações

**Substituir a seção "Como funciona?" (linhas 167-195) por:**

```typescript
{/* Informações */}
<div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
        <QrCode className="w-5 h-5" />
        Como funciona?
    </h3>
    <ol className="text-sm text-blue-800 space-y-2">
        <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Informe seu nome e telefone</span>
        </li>
        <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Escolha como deseja pagar (agora ou no final)</span>
        </li>
        <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Escaneie o QR Code da sua mesa</span>
        </li>
        <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>Navegue pelo cardápio e faça seus pedidos</span>
        </li>
        <li className="flex items-start gap-2">
            <span className="font-bold">5.</span>
            <span>Acompanhe o status em tempo real</span>
        </li>
    </ol>
</div>
```

---

## ✅ Checklist de Verificação

Após fazer as alterações, verifique:

- [ ] Import do PaymentChoice adicionado
- [ ] Estado `step` e `formaPagamento` adicionados
- [ ] Função `handleContinuarParaPagamento` criada
- [ ] Função `handleSelecionarPagamento` criada
- [ ] Função `handleSubmit` atualizada para receber `formaPagamento`
- [ ] Render atualizado com steps condicionais
- [ ] Botão "Voltar" adicionado no step de pagamento
- [ ] Informações atualizadas com novo passo

---

## 🧪 Como Testar

1. Acesse: http://localhost:3000/comanda/nova
2. Preencha nome e telefone
3. Clique em "Continuar"
4. Deve aparecer a tela de escolha de pagamento
5. Selecione uma opção
6. Verifique se a comanda é criada com `formaPagamento`

---

## 🐛 Possíveis Erros

### Erro: "Cannot find module '@/components/PaymentChoice'"

**Solução:** Verifique se o arquivo `PaymentChoice.tsx` está em `frontend/components/`

### Erro: "Property 'formaPagamento' does not exist"

**Solução:** Verifique se adicionou `formaPagamento` no estado inicial do formData

### Erro: "handleSelecionarPagamento is not defined"

**Solução:** Verifique se adicionou a função antes do return

---

**Boa sorte! 🚀**
