# Request <-> Response

http://localhost:3000/deliveries -> 80 HTTP ou 443 HTTPS

O http é o esquema (HTTP, HTTPS, FTP, etc), localhost é o host (google.com,
iamsolame.shop, etc), 3000 é a porta TCP usada para a conexão, e /deliveries é o
path, o caminho do recurso.

```
Ler   Criar  Atualizar     Apagar
GET / POST / PATCH / PUT / DELETE / HEAD / OPTIONS / CONNECT / TRACE

/auth/login                     POST        autenticar usuário                        Aberta         PUBLIC

/user/                          POST        Criar usuário                             JWT            ADMIN
/user/me                        GET         Ler usuário                               JWT            ALL
/user/motoboy                   GET         Ler todos os motoboys                     JWT            ALL
/user/me                        PATCH       Atualizar usuário                         JWT            ALL
/user/me/password               PATCH       Atualizar senha                           JWT            ALL
/user/:uuid                     DELETE      Apagar usuário                            JWT            ADMIN

/customer/                      POST        Criar cliente com endereço                JWT            ADMIN/OPERATOR
/customer/:uuid                 PATCH       Atualizar cliente e/ou endereço           JWT            ADMIN/OPERATOR

/delivery/                      GET         Ver todos os pedidos                      JWT
/delivery/:boolean              GET         Ver todos os pedidos pagos                JWT
/delivery/me                    GET         Ver todos os pedidos de um usuário        JWT
/delivery/me/:uuid              GET         Ver um pedido de um usuário               JWT
/delivery/me                    POST        Criar uma entrega                         JWT
/delivery/me/:uuid              PATCH       Atualizar uma entrega                     JWT
/delivery/me/:uuid              DELETE      Apagar uma entrega                        JWT

/voucher/me                     POST        Criar compra/vale                         JWT             ALL
/voucher/me/user/:uuid          POST        Criar compra/vale para usuário            JWT             ADMIN/OPERATOR
/voucher/:uuid                  GET         Ler compra/vale de um usuário             JWT             ADMIN/OPERATOR
/voucher/user/:uuid             GET         Ler todas as compras/vales de um usuário  JWT             ADMIN/OPERATOR
/voucher/me                     GET         Ler todas as compras/vales                JWT             ALL
/voucher/me/:uuid               PATCH       Atualizar compra/vale                     JWT             ALL
/voucher/me/user/:uuid          PATCH       Atualizar compra/vale de um usuário       JWT             ADMIN/OPERATOR
/voucher/me/:uuid               DELETE      Apagar uma compra/vale                    JWT             ALL
```

Obs.: Rotas que contém 'me' usam os dados do usuário que vem por meio do objeto
da requisição.
