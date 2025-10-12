# Documentação da API do app Geladinha Delivery

## Futuramente serão detalhadas ainda mais essas operações

```
Ler   Criar   Atualizar    Apagar
GET / POST / PATCH / PUT / DELETE

/auth/login                     POST        Autenticar usuário                        Aberta         PUBLIC

/user/                          POST        Criar usuário                             JWT            ADMIN
/user/me                        GET         Ler usuário                               JWT            ALL
/user/motoboy                   GET         Ler todos os motoboys                     JWT            ALL
/user/me                        PATCH       Atualizar usuário                         JWT            ALL
/user/me/password               PATCH       Atualizar senha                           JWT            ALL
/user/:uuid                     DELETE      Apagar usuário                            JWT            ADMIN

/customer/                      POST        Criar cliente com endereço                JWT            ADMIN/OPERATOR
/customer/find?key=value        GET         Ler cliente                               JWT            ADMIN/OPERATOR
/customer/                      GET         Ler todos os clientes                     JWT            ADMIN/OPERATOR
/customer/:uuid                 PATCH       Atualizar cliente e/ou endereço           JWT            ADMIN/OPERATOR
/customer/:uuid                 DELETE      Apagar cliente                            JWT            ADMIN/OPERATOR
/customer/:uuid/address         GET         Ler todos os endereços de um cliente      JWT            ADMIN/OPERATOR
/customer/:uuid/address         POST        Adicionar endereço                        JWT            ADMIN/OPERATOR
/customer/address/:uuid         DELETE      Apagar endereço                           JWT            ADMIN/OPERATOR

/delivery/me                    POST        Criar entrega                             JWT            ADMIN/OPERATOR
/delivery/me                    GET         Ler minhas entregas                       JWT            ALL
/delivery/me/:uuid              PATCH       Atualizar entrega                         JWT            ADMIN/OPERATOR
/delivery/:uuid                 GET         Ler entrega                               JWT            ADMIN/OPERATOR
/delivery?key=value             GET         Ler todas as entregas                     JWT            ADMIN/OPERATOR
/delivery/me/:uuid              DELETE      Apagar entrega                            JWT            ADMIN/OPERATOR

/voucher/me                     POST        Criar compra/vale                         JWT             ALL
/voucher/me/user/:uuid          POST        Criar compra/vale para usuário            JWT             ADMIN/OPERATOR
/voucher/:uuid                  GET         Ler compra/vale de um usuário             JWT             ADMIN/OPERATOR
/voucher/user/:uuid             GET         Ler todas as compras/vales de um usuário  JWT             ADMIN/OPERATOR
/voucher/me                     GET         Ler minhas compras/vales                  JWT             ALL
/voucher/me/:uuid               PATCH       Atualizar compra/vale                     JWT             ALL
/voucher/me/user/:uuid          PATCH       Atualizar compra/vale de um usuário       JWT             ADMIN/OPERATOR
/voucher/me/:uuid               DELETE      Apagar uma compra/vale                    JWT             ALL

/payout/                        POST        Criar pagamento para um motoboy           JWT             ADMIN/OPERATOR
/payout/preview?key=value       GET         Pré-visualizar pagamento do motoboy       JWT             ALL
/payout/:uuid                   GET         Ler pagamento do motoboy                  JWT             ALL
/payout?key=value               GET         Ler todos os pagamentos do motoboy        JWT             ALL
/payout/:uuid                   PATCH       Atualizar pagamento do motoboy            JWT             ADMIN/OPERATOR
/payout/:uuid/:bool             PATCH       Atualizar status do pagamento             JWT             ADMIN
/payout/:uuid                   DELETE      Apagar pagamento do motoboy               JWT             ADMIN/OPERATOR

/settlement/                    POST        Criar caixa para um televendas            JWT             ADMIN/OPERATOR
/settlement/preview?key=value   GET         Pré-visualizar caixa do televendas        JWT             ADMIN/OPERATOR
/settlement/:uuid               PATCH       Atualizar caixa do televendas             JWT             ADMIN/OPERATOR
```

Obs.: Rotas que contém 'me' usam os dados do usuário que vem por meio do objeto
da requisição.
