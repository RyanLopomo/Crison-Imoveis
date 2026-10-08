This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Conta administrativa

Configure `DATABASE_URL` (PostgreSQL/Neon), `DIRECT_URL` (conexão direta para migrations), `AUTH_SECRET` (mínimo 32 caracteres), `ADMIN_EMAIL` e `ADMIN_PASSWORD_HASH` (bcrypt). O primeiro acesso ou pedido de recuperação cria uma única conta inicial no banco. Depois disso, nome, e-mail e senha são gerenciados no painel; as variáveis de bootstrap não sobrescrevem alterações. Sessões anteriores à atualização precisam entrar novamente.

Configure `RESEND_API_KEY`, `EMAIL_FROM` (remetente de domínio verificado no Resend) e `NEXT_PUBLIC_APP_URL` (origem HTTPS pública, sem caminho). Verifique o domínio e seus registros DNS no Resend e crie uma chave com permissão de envio. Não use o remetente de testes para enviar a destinatários arbitrários. A recuperação é processada após a resposta usando `after`, compatível com Vercel; falhas de processamento geram apenas uma mensagem genérica nos logs, sem credenciais ou tokens.

Aplique migrations com `npx prisma migrate deploy` antes de publicar. No desenvolvimento, use `npx prisma migrate dev`. Links duram 20 minutos, são de uso único e armazenam apenas SHA-256; as senhas usam bcrypt com custo 12. Limites são persistidos no PostgreSQL e compartilhados entre instâncias da Vercel. Mudança de senha revoga outras sessões; recuperação ou confirmação de e-mail revoga todas.

SMS é opcional e ainda não está ativado. O campo `recoveryPhone` e a interface `RecoveryDelivery` reservam a estrutura para um provider futuro; a ativação exigirá verificação do telefone e configuração do provider. Nenhuma variável de SMS é necessária atualmente.

## Auditoria e testes de segurança

Consulte `SECURITY_AUDIT.md` antes de publicar. A migration `20261007010000_revocable_sessions` cria sessões revogáveis: aplique `npm run db:migrate` no banco de destino antes do deploy. Sessões antigas exigem novo login. O upload aceita JPG, PNG e WebP de até 4 MB, valida o conteúdo com Sharp e reencoda a imagem no servidor.

Execute `npm run build` e depois `npm run test:security`. O teste cria PostgreSQL local temporário com credenciais aleatórias, aplica as migrations nesse banco e testa HTTP e navegador. Nunca usa o Neon nem as chaves reais do `.env`. O SDK do Resend aponta apenas para um receptor HTTP local no teste; chamadas externas são bloqueadas. No Windows, usa Edge; em outros sistemas, instale Chromium com `npx playwright install chromium`. O teste encerra os serviços e remove somente seus arquivos temporários.

A CSP usa nonces por requisição, exigindo renderização dinâmica. As dependências transitivas corrigidas estão fixadas em `overrides`; reavalie esses pins quando atualizar Prisma/tsx. Não use `npm audit fix --force` para contornar os alertas restantes de desenvolvimento: ele propõe downgrades incompatíveis.
