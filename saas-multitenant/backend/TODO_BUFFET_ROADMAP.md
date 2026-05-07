# TODO_BUFFET_ROADMAP

## Banco (PostgreSQL)
- [ ] Criar migrations/SQL para `quotations`, `quotation_items`, `events` com `tenant_id`
- [ ] Criar indexes e (se usado no projeto) RLS policies por `tenant_id`

## Backend (Node/Express)
- [ ] Implementar `models/quotationModels.js`
- [ ] Implementar `models/eventModels.js`
- [ ] Implementar rotas CRUD de quotations
- [ ] Implementar rotas CRUD + detalhes e conflito de datas de events
- [ ] Implementar rotas de billing/stats conforme roadmap
- [ ] Registrar as novas rotas no `backend/app.js`

## Front (Next.js)
- [ ] Criar/atualizar telas para simulador, pipeline, agenda e dashboard
- [ ] Ajustar `app/lib/api.js` e libs para novos endpoints

## Testes/Validação
- [ ] Rodar backend e validar endpoints via curl/Postman
- [ ] Ajustar qualquer divergência de schema (UUID vs integer, etc)

