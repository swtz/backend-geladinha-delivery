# Geladinha Delivery – API do Sistema

A API Geladinha Delivery é o conjunto de serviços que permite operar todo o
sistema interno do delivery, incluindo gestão de usuários, empresas, clientes,
entregas, pagamentos e vales.  
Ela funciona como o “cérebro” do aplicativo e conecta todas as partes do
negócio.

---

## 💡 O que esta API faz

A API permite:

- Gerenciar usuários do sistema (administradores, operadores e motoboys)
- Cadastrar e administrar empresas (locais de operação)
- Controlar horários de funcionamento
- Cadastrar clientes e endereços
- Criar e acompanhar entregas
- Registrar compras/vales (vouchers)
- Gerar pagamentos para motoboys
- Administrar caixa (settlements) de operadores e televendas

Em outras palavras, ela é responsável por **toda a operação digital do Geladinha
Delivery**.

---

## 🚀 Como o sistema funciona (em termos de negócio)

1. **O usuário faz login** (administrador, operador ou motoboy)
2. Cada tipo de usuário tem acesso ao que precisa:
   - _Admin:_ controla tudo
   - _Operator:_ atende pedidos e gerencia clientes
   - _Motoboy:_ vê e atualiza suas entregas e pagamentos
3. A API recebe solicitações do aplicativo e retorna:
   - Dados de clientes
   - Novas entregas
   - Status de pagamentos
   - Caixas/vales
   - Informações do motoboy

O aplicativo se comunica com a API usando um token de segurança (JWT) para
garantir que cada usuário acesse apenas o que deve.

---

## 🧩 Módulos principais

### **1. Usuários**

Permite criar e gerenciar:

- Administradores
- Operadores
- Motoboys

### **2. Empresas (Place)**

Cada empresa pode ter:

- Informações próprias
- Horários de atendimento
- Responsáveis

### **3. Clientes**

Cadastro de clientes e seus endereços.

### **4. Entregas (Delivery)**

Criação, consulta e atualização de entregas.

### **5. Vales (Voucher)**

Registro e controle de vales/compras.

### **6. Pagamentos para Motoboys (Payout)**

Cálculos e pagamentos para entregadores.

### **7. Caixa / Televendas (Settlement)**

Controle do caixa diário para operadores.

---

## 🔐 Segurança

Toda operação autenticada utiliza **JWT (JSON Web Token)**.  
Isso garante:

- segurança dos dados
- acesso controlado por tipo de usuário
- operação confiável

Rotas com `/me` usam automaticamente o usuário do token.

---

## 📌 Rotas da API (Resumo)

Abaixo estão todas as rotas principais divididas por módulo.  
_Esta parte é mais técnica, mas útil como referência rápida._

### **Autenticação**

- `POST /auth/login` — Autentica o usuário

### **Usuário (User)**

- Criar, ler, atualizar e apagar usuários
- Consultar motoboys
- Atualizar senha
- Consultar informações do próprio usuário

### **Empresa (Place)**

- Criar e editar empresa
- Gerenciar horários de funcionamento

### **Horários (Work-Time)**

- Criar, editar e listar horários de serviço

### **Cliente (Customer)**

- Criar cliente com endereço
- Adicionar e editar endereços
- Listar clientes

### **Entrega (Delivery)**

- Criar entrega
- Ver minhas entregas
- Atualizar e apagar entregas

### **Vale/Compra (Voucher)**

- Criar vale
- Ver minhas compras/vales
- Atualizar e apagar vales

### **Pagamento (Payout)**

- Criar pagamento
- Visualizar e atualizar pagamentos

### **Caixa / Televendas (Settlement)**

- Criar caixa
- Atualizar e listar caixas

---

## 📞 Suporte e Continuidade

Mais módulos, relatórios e integrações podem ser adicionados conforme a
necessidade da operação.

Para dúvidas ou solicitações, entre em contato com o responsável técnico ou
administrador do sistema → luderser@hotmail.com / (48) 996642905 (Leonardo).
