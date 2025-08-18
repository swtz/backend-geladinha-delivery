# Request <-> Response

http://localhost:3000/deliveries -> 80 HTTP ou 443 HTTPS

O http é o esquema (HTTP, HTTPS, FTP, etc), localhost é o host (google.com,
iamsolame.shop, etc), 3000 é a porta TCP usada para a conexão, e /deliveries é o
path, o caminho do recurso.

```
Ler   Criar  Atualizar     Apagar
GET / POST / PATCH / PUT / DELETE / HEAD / OPTIONS / CONNECT / TRACE

/auth/login                     POST        autenticar usuário                        Aberta

/user/                          POST        Criar usuário                             Aberta
/user/me                        GET         Ler usuário                               JWT
/user/me                        PATCH       Atualizar usuário                         JWT
/user/me                        DELETE      Apagar usuário                            JWT
/user/me/password               PATCH       Atualizar senha                           JWT

/delivery-man/                  POST        Criar motoboy                             Aberta
/delivery-man/me/:uuid          PATCH       Atualizar motoboy                         JWT
/delivery-man/me                GET         Ler motoboy                               JWT
/delivery-man/                  GET         Ler todos os motoboys                     JWT
/delivery-man/me                DELETE      Apagar motoboy                            JWT
/delivery-man/me/password       PATCH       Atualizar senha                           JWT

/delivery/                      GET         Ver todos os pedidos                      JWT
/delivery/:boolean              GET         Ver todos os pedidos pagos                JWT
/delivery/me                    GET         Ver todos os pedidos de um usuário        JWT
/delivery/me/:uuid              GET         Ver um pedido de um usuário               JWT
/delivery/me                    POST        Criar uma entrega                         JWT
/delivery/me/:uuid              PATCH       Atualizar uma entrega                     JWT
/delivery/me/:uuid              DELETE      Apagar uma entrega                        JWT

/voucher/me/:uuid               POST        Criar compra/vale para motoboy            JWT
/voucher/me/:uuid               PATCH       Atualizar compra/vale para motoboy        JWT
/voucher/:uuid                  GET         Ler uma compra/vale                       JWT
/voucher/me                     GET         Ler todas as compras/vale de um motoboy   JWT
```

Obs.: Rotas que contém 'me' usam os dados do usuário que vem por meio do objeto
da requisição.
