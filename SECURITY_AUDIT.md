# Auditoria de segurança — 2026-10-07

**Resultado: FAIL.** Existem alertas HIGH de desenvolvimento sem correção publicada e credenciais compartilhadas cuja revogação precisa ser confirmada. Não foi comprovado acesso anônimo ao painel nem às operações administrativas.

## Escopo e limites

Revisão de frontend, APIs, autenticação, Prisma/PostgreSQL, uploads, dependências e histórico Git. Explorações HTTP e navegador executadas somente contra uma instância local do projeto, com PostgreSQL local temporário e contas/imóveis sintéticos. Nenhuma alteração nos dados do Neon, nenhum ataque a produção, Resend, Vercel Blob ou infraestrutura externa. Sem brute force, volumetria ou comandos destrutivos.

O SDK real do Resend usa seu suporte a `RESEND_BASE_URL` exclusivamente no processo de teste para apontar a um receptor HTTP local. Foram verificadas as requisições POST, destinatário e link de recuperação. Isso testa a integração e as regras da aplicação; não comprova entrega em uma caixa postal real. Upload válido para o serviço Blob externo também não foi executado.

## Falhas e evidências

### HIGH — sessão continuava válida após logout: corrigido

- Arquivos: `src/lib/auth.ts`, `src/app/api/admin/logout/route.ts`, `src/proxy.ts`.
- O logout apagava somente o cookie do navegador; uma cópia do JWT continuava autorizada até expirar.
- Prova anterior à correção: login da conta sintética, cópia do cookie, POST de logout e GET `/api/admin/properties` com o cookie copiado retornaram **200**.
- Correção: `AdminSession` no PostgreSQL, identificador aleatório armazenado como SHA-256, expiração e verificação em cada autenticação. Logout remove a sessão correspondente. Mudanças de senha e confirmação de e-mail invalidam as sessões anteriores.
- Regressão: reutilização após logout retorna **401**, enquanto outra sessão legítima permanece ativa; troca/reset de senha revoga os cookies antigos.

### MEDIUM — upload confiava no MIME declarado: corrigido

- Arquivos: `src/app/api/admin/upload/route.ts`, `src/components/admin/ImageUpload.tsx`.
- A implementação anterior emitia autorização de upload usando apenas tamanho e MIME declarados pelo cliente. Não examinava os bytes. Evidência por inspeção do handler; exploração do armazenamento externo não foi feita.
- Risco: hospedar conteúdo não correspondente à imagem declarada. Não foi comprovado stored XSS no domínio da aplicação.
- Correção: envio ao servidor autenticado, limite de 4 MB compatível com o corpo de requisição na Vercel, assinatura binária, MIME/extensão consistentes, limite de pixels, decodificação e reencodificação com Sharp. Caminho de destino aleatório e metadados removidos.
- Regressão: HTML renomeado para JPG, SVG, extensão dupla, nomes com traversal e PNG declarado como JPEG são rejeitados antes de acessar o Blob.

### MEDIUM — corpos JSON sem limite antes de leitura: corrigido

- Arquivos: `src/lib/account.ts`, `src/app/api/properties/route.ts`, `src/app/api/properties/[id]/route.ts`.
- Os handlers liam todo o corpo com `text()`/`json()` antes de validar tamanho, ou sem limite. Isso podia aumentar consumo de memória. Evidência no código; teste de DoS não foi executado.
- Correção: leitor de stream limitado, cancelamento ao ultrapassar o limite e validação de JSON no servidor. Recuperação não calcula bcrypt para tokens inválidos.
- Regressão: payload pequeno de teste acima de 4 KB no login é rejeitado com **413**; limites das operações administrativas também são aplicados no servidor.

### MEDIUM — hashes antigos no histórico Git: pendente

- Arquivo histórico: `src/app/api/admin/login/route.ts`.
- Commits identificados: `642a4119`, `56418b3d`, `f8584509`.
- O código histórico contém um hash bcrypt literal. Seu valor não foi impresso nem copiado para este relatório. Não foi comprovado comprometimento da senha atual.
- O código atual e os arquivos versionados não contêm os valores secretos atuais do `.env`.
- Ação manual: trocar qualquer senha que possa ter sido reutilizada e decidir como sanear o histórico com os colaboradores. A auditoria não reescreveu commits.

### LOW — URLs de imagem com credenciais embutidas: corrigido

- Arquivo: `src/lib/property-validation.ts`.
- Prova: execução isolada do validador original do HEAD aceitou uma URL HTTPS de Blob com `username:password@host` sintéticos.
- Risco: propagar credenciais na URL para HTML e requisições do navegador. Nenhuma credencial real foi utilizada; não havia fetch server-side desse campo.
- Correção: rejeição de usuário, senha e porta na URL. URLs privadas e hosts externos continuam rejeitados.

### LOW — headers e logs: reforçados

- Arquivos: `next.config.ts`, `src/proxy.ts`, `src/app/layout.tsx`.
- A configuração anterior não tinha CSP/HSTS. Não foi encontrado XSS executável nos campos renderizados pelo React.
- CSP com nonce por requisição, `frame-ancestors 'none'`, bloqueio de scripts sem nonce e HSTS em produção. Estilos inline continuam permitidos para preservar animações existentes.
- Páginas administrativas usam `private, no-store`; links de recuperação/confirmação usam `Referrer-Policy: no-referrer`.
- Logging de desenvolvimento ignora URLs dessas páginas e argumentos de Server Functions. Nenhum token real foi encontrado no arquivo de log examinado.
- Regressão no navegador: payload stored XSS é exibido como texto; hydration, drawer e navegação continuam funcionando sob CSP.

## Dependências

`npm audit` inicialmente encontrou 9 alertas HIGH e 1 LOW. Atualizações compatíveis e pins transitivos corrigiram `deepmerge-ts`, `mysql2` e `esbuild`, sem downgrade de Prisma/Next nem troca do PostgreSQL. Build e lint validam a compatibilidade dos pins.

Permanecem **5 alertas HIGH**, todos derivados de `braces <=3.0.3` na cadeia de desenvolvimento `eslint-config-next → fast-glob → micromatch → braces`. O [advisory oficial](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) informa que não existe versão corrigida. Nenhum endpoint da aplicação usa padrões de glob controlados pelo usuário. Não foi executado payload para esgotar a pilha.

`npm audit --omit=dev` não encontrou vulnerabilidades. Isso não elimina os alertas da instalação de desenvolvimento. Não foi aplicado `npm audit fix --force`, que propõe downgrade incompatível de ferramentas.

## Outras proteções verificadas

- APIs de criação, edição, exclusão e upload validam autenticação, Origin e rate limit diretamente, além do Proxy. Dependência anterior exclusiva do Proxy foi eliminada como defesa em profundidade; não foi comprovado bypass HTTP do Proxy.
- Rotas `/admin`, `/admin/novo-imovel`, `/admin/imoveis` e `/admin/configuracoes` redirecionam visitantes não autenticados ao login.
- Cookies possuem HttpOnly, Secure em produção, SameSite Strict e expiração. Login gera novo identificador de sessão.
- Validação de mass assignment, formatos de IDs, payloads de login, senha atual e força da nova senha.
- Queries Prisma e SQL parametrizado; sem sinks de comando, templates executáveis ou banco NoSQL na aplicação.
- Tokens aleatórios de 32 bytes, somente SHA-256 persistido, expiração e consumo único em transação com lock. Duas tentativas simultâneas de reset resultam em um sucesso.
- Manipular `adminId`/e-mail na confirmação não altera a conta ou destinatário associados ao token; a segunda conta sintética permanece intacta.
- Resposta de recuperação genérica preservada para usuário inexistente ou limite por e-mail atingido.
- Limites são provados sem brute force: o teste inicializa o bucket de sua própria base local e envia uma única requisição.
- Nenhuma API administrativa retorna `passwordHash`, `tokenHash` ou chaves. Banco/env são protegidos por `server-only`.
- Não há propriedade por tenant no modelo atual: todas as contas `Admin` têm o mesmo papel administrativo. Isso não foi classificado como IDOR entre tenants inexistentes.

## Pendências antes de produção

1. Revogar a chave Resend compartilhada na conversa e configurar outra chave privada, caso ainda não tenha sido revogada. Revogação não foi verificada contra o serviço externo.
2. Tratar hashes históricos e possível reutilização de senha.
3. Resolver o advisory `braces` quando houver correção compatível; não considerar esta auditoria PASS enquanto o HIGH conhecido estiver pendente.
4. Aplicar `20261007010000_revocable_sessions` com `npm run db:migrate` no banco de destino antes de publicar. Migrations foram aplicadas apenas no PostgreSQL temporário do teste; sessões antigas exigirão novo login.
5. Validar entrega de e-mail e upload válido no ambiente staging da empresa, com suas próprias contas e domínio autorizado.

## Reproduzir

Validação final: **105 verificações de regressão passaram**; TypeScript, lint e build passaram. A inspeção de 19 arquivos estáticos do frontend não encontrou os valores secretos atuais. `npm audit --omit=dev`: zero alertas; `npm audit`: cinco HIGH de desenvolvimento, com saída não zero esperada e registrada como pendência.

```sh
npm run build
npm run test:security
npx tsc --noEmit
npm run lint
npm audit
npm audit --omit=dev
```

O teste não reutiliza as URLs ou credenciais reais do `.env`. Fora do Windows, instale o Chromium do Playwright antes de executar. O teste do transporte de e-mail é declarado e limitado à fronteira externa; não substitui autenticação, Prisma, transações, tokens ou validações por mocks.
