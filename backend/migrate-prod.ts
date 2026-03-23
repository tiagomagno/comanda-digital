import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://api.187.77.231.120.nip.io/api';
// const API_BASE = 'http://localhost:3001/api'; // para testes locais se precisar

const EMAIL = 'contato@kizansushi.com.br';
const PASSWORD = process.argv[2] || 'Y4vV8sXJC2XuZKe';

async function delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}

async function run() {
    try {
         console.log('Iniciando migração de cardápio para ONLINE...');

         const loginRes = await fetch(`${API_BASE}/auth/login`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ email: EMAIL, senha: PASSWORD })
         });

         if (!loginRes.ok) {
             console.error('Falha no login online', await loginRes.text());
             return;
         }

         const authData = await loginRes.json();
         const token = authData.token;
         console.log('✅ Login online com sucesso! Token OK.');

         const rawData = fs.readFileSync('kizan-data.json', 'utf-8');
         const categorias = JSON.parse(rawData);

         console.log(`Encontradas ${categorias.length} categorias para subir...`);

         const existingCatsRes = await fetch(`${API_BASE}/categorias`, { headers: { 'Authorization': `Bearer ${token}` } });
         const existingCats = existingCatsRes.ok ? await existingCatsRes.json() : [];

         const existingProdsRes = await fetch(`${API_BASE}/produtos`, { headers: { 'Authorization': `Bearer ${token}` } });
         const existingProds = existingProdsRes.ok ? await existingProdsRes.json() : [];

         for (const cat of categorias) {
             console.log(`\n📦 Processando categoria: ${cat.nome}`);
             
             let newCatId = existingCats.find((c: any) => c.nome === cat.nome)?.id;

             if (!newCatId) {
                 const catRes = await fetch(`${API_BASE}/categorias`, {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${token}`
                     },
                     body: JSON.stringify({
                         nome: cat.nome,
                         descricao: cat.descricao || '',
                         destino: cat.destino || 'COZINHA',
                         cor: cat.cor || '#3b82f6',
                         icone: cat.icone || '',
                         ordem: cat.ordem || 0
                     })
                 });

                 if (!catRes.ok) {
                     console.error(`❌ Erro ao criar a categoria ${cat.nome}`, await catRes.text());
                     continue; 
                 }
                 const newCatData = await catRes.json();
                 newCatId = newCatData.id;
                 console.log(`✅ Categoria criada [${cat.nome}]`);
             } else {
                 console.log(`ℹ️ Categoria já existe [${cat.nome}], aproveitando ID: ${newCatId}`);
             }

             const produtos = cat.produtos || [];
             console.log(`   -> Iniciando ${produtos.length} produtos dessa categoria...`);

             for (const prod of produtos) {
                 const alreadyExists = existingProds.find((p: any) => p.nome === prod.nome && p.categoriaId === newCatId);
                 if (alreadyExists) {
                     console.log(`   ℹ️ Produto já existe: ${prod.nome}`);
                     continue;
                 }

                 const img = (prod.imagemUrl && prod.imagemUrl.startsWith('http')) ? prod.imagemUrl : '';
                 const body: any = {
                     categoriaId: newCatId,
                     codigo: prod.codigo || '',
                     nome: prod.nome,
                     descricao: prod.descricao || '',
                     preco: Number(prod.preco) || 0,
                     imagemUrl: img,
                     videoUrl: (prod.videoUrl && prod.videoUrl.startsWith('http')) ? prod.videoUrl : '',
                     disponivel: prod.disponivel ?? true,
                     destaque: prod.destaque ?? false,
                     ordem: prod.ordem ?? 0,
                     estoqueControlado: prod.estoqueControlado ?? false,
                     quantidadeEstoque: prod.quantidadeEstoque ?? 0
                 };
                 if (prod.precoPromocional && Number(prod.precoPromocional) > 0) {
                     body.precoPromocional = Number(prod.precoPromocional);
                 }

                 const prodRes = await fetch(`${API_BASE}/produtos`, {
                     method: 'POST',
                     headers: {
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${token}`
                     },
                     body: JSON.stringify(body)
                 });

                 if (!prodRes.ok) {
                     console.error(`   ❌ Erro no produto ${prod.nome}:`, await prodRes.text());
                 } else {
                     console.log(`   ✅ Produto importado: ${prod.nome}`);
                 }
                 // Delay para não sobrecarregar
                 await delay(200);
             }
         }

         console.log('\n\n🚀 ✨ UPLOAD DO CARDÁPIO DE KIZAN FINALIZADO COM SUCESSO! ✨');

    } catch(e) {
        console.error('Exception global script migração:', e);
    }
}

run();
