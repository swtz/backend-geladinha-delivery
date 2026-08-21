# Request <-> Response

http://localhost:3000/delivery -> 80 HTTP ou 443 HTTPS

O http é o esquema (HTTP, HTTPS, FTP, etc), localhost é o host (google.com,
iamsolame.shop, etc), 3000 é a porta TCP usada para a conexão, e /deliveries é o
path, o caminho do recurso.

```
Ler   Criar  Atualizar     Apagar
GET / POST / PATCH / PUT / DELETE / HEAD / OPTIONS / CONNECT / TRACE

/auth/login                                 POST        Autenticar usuário                               Aberta          PUBLIC

/user                                       POST        Criar usuário                                    JWT             ADMIN
/user/me                                    GET         Ler meu usuário                                  JWT             ALL
/user/:uuid                                 GET         Ler usuário                                      JWT             ADMIN/OPERATOR
/user?key=value                             GET         Ler todos os usuários                            JWT             ADMIN/OPERATOR
/user/me                                    PATCH       Atualizar meu usuário                            JWT             ALL
/user/:uuid                                 PATCH       Atualizar usuário                                JWT             ADMIN/OPERATOR
/user/me/password                           PATCH       Atualizar senha                                  JWT             ALL
/user/:uuid                                 DELETE      Apagar usuário                                   JWT             ADMIN

/motoboy                                    POST        Criar motoboy com motocicleta                    JWT             ADMIN
/motoboy/:uuid                              POST        Criar motoboy usando uma motocicleta             JWT             ADMIN
/motoboy                                    GET         Ler todos os motoboys                            JWT             ADMIN/OPERATOR
/motoboy/:uuid                              GET         Ler motoboy                                      JWT             ADMIN/OPERATOR
/motoboy/me/motorcycle                      PATCH       Atualizar minha motocicleta                      JWT             MOTOBOY
/motoboy/:uuid                              PATCH       Atualizar motoboy                                JWT             ADMIN
/motoboy/motorcycle/restrict/:uuid          PATCH       Atualizar placa/dono/motorista da motocicleta    JWT             ADMIN

/motorcycle                                 POST        Criar motocicleta                                JWT             NULL
/motorcycle?key=value                       GET         Ler todas as motocicletas                        JWT             NULL
/motorcycle/:uuid                           GET         Ler motocicleta                                  JWT             NULL
/motorcycle                                 DELETE      Apagar motocicleta                               JWT             NULL

/place/me                                   POST        Criar empresa                                    JWT             ADMIN
/place/:uuid                                GET         Ler empresa                                      JWT             ADMIN
/place?key=value                            GET         Ler todas as empresas                            JWT             ADMIN
/place/me/:uuid                             PATCH       Atualizar empresa                                JWT             ADMIN
/place/me/:uuid/:code                       PATCH       Atualizar código da empresa                      JWT             ADMIN
/place/me/:uuid                             DELETE      Apagar empresa                                   JWT             ADMIN (OWNER)

/work-time-place/me/:uuid                   POST        Adicionar horário de serviço                     JWT             ADMIN (OWNER)
/work-time-place                            GET         Ler horários de serviço                          JWT             ADMIN
/work-time-place/date                       GET         { from: <ISO8601>, to: <ISO8601> }               JWT             ADMIN
/work-time-place/me/:uuid                   PATCH       Atualizar horário de serviço compartilhado       JWT             ADMIN
/work-time-place/me/:uuid                   DELETE      Apagar horário de serviço compartilhado          JWT             ADMIN (OWNER)

work-time-user/:uuid                        PUT         Definir horário de serviço                       JWT             ADMIN
work-time-user/shared/:userId/:workTimeId   PUT         Definir horário de serviço compartilhado         JWT             ADMIN
work-time-user/me/interval-time             POST        Criar horário de intervalo para mim              JWT             ADMIN
work-time-user/me/interval-time/:uuid       POST        Criar horário de intervalo                       JWT             ADMIN

/work-time/me                               GET         Ler meu horário de serviço                       JWT             ALL
/work-time/:uuid                            GET         Ler horário de serviço                           JWT             ALL
/work-time?key=value                        GET         Ler todos os horários de serviço                 JWT             ADMIN
/work-time/:uuid                            PATCH       Atualizar horário de serviço                     JWT             ADMIN
/work-time/:uuid                            DELETE      Apagar horário de serviço                        JWT             ADMIN

/interval-time/me                           GET         Ler meu horário de intervalo                     JWT             ADMIN/OPERATOR
/interval-time/:uuid                        GET         Ler horário de intervalo                         JWT             ADMIN/OPERATOR
/interval-time/?key=value                   GET         Ler todos os horários de intervalo               JWT             ADMIN/OPERATOR
/interval-time/:uuid                        PATCH       Atualizar horário de intervalo                   JWT             ADMIN/OPERATOR
/interval-time/:uuid                        DELETE      Apagar horário de intervalo                      JWT             ADMIN/OPERATOR

/customer                                   POST        Criar cliente com endereço                       JWT             ADMIN/OPERATOR
/customer                                   GET         Ler todos os clientes                            JWT             ADMIN/OPERATOR
/customer/find?key=value                    GET         Ler cliente                                      JWT             ADMIN/OPERATOR
/customer/:uuid                             PATCH       Atualizar cliente                                JWT             ADMIN/OPERATOR
/customer/:uuid                             DELETE      Apagar cliente                                   JWT             ADMIN
/customer/:uuid/address                     POST        Adicionar endereço                               JWT             ADMIN/OPERATOR
/customer/address/:uuid                     DELETE      Remover endereço                                 JWT             ADMIN/OPERATOR

/address/:uuid                              GET         Ler endereço                                     JWT             ADMIN/OPERATOR
/address?key=value                          GET         Ler todos os endereços                           JWT             ADMIN/OPERATOR
/address/:uuid                              PATCH       Atualizar endereço                               JWT             ADMIN/OPERATOR
/address/:uuid                              DELETE      Apagar endereço                                  JWT             ADMIN

/delivery/me                                POST        Criar entrega                                    JWT             ADMIN/OPERATOR
/delivery/:uuid                             GET         Ler entrega                                      JWT             ADMIN/OPERATOR
/delivery/me                                GET         Ler minhas entregas                              JWT             ALL
/delivery?key=value                         GET         Ler todas as entregas                            JWT             ALL
/delivery/me/:uuid                          PATCH       Atualizar entrega                                JWT             ADMIN/OPERATOR
/delivery/me/:uuid                          DELETE      Apagar entrega                                   JWT             ADMIN/OPERATOR

/tip/:uuid                                  DELETE      Apagar gorjeta                                   JWT             ADMIN/OPERATOR

/voucher/me                                 POST        Criar compra/vale                                JWT             ADMIN
/voucher/me/user/:uuid                      POST        Criar compra/vale para usuário                   JWT             ADMIN
/voucher/:uuid                              GET         Ler compra/vale de um usuário                    JWT             ADMIN
/voucher/me                                 GET         Ler minhas compras/vales                         JWT             ALL
/voucher?key=value                          GET         Ler todas as compras/vales                       JWT             ADMIN
/voucher/me/:uuid                           PATCH       Atualizar compra/vale                            JWT             ADMIN
/voucher/me/user/:uuid                      PATCH       Atualizar compra/vale de um usuário              JWT             ADMIN
/voucher/me/:uuid                           DELETE      Apagar compra/vale                               JWT             ADMIN

/payout                                     POST        Criar pagamento para um motoboy                  JWT             ADMIN/OPERATOR
/payout/preview?key=value                   GET         Pré-visualizar pagamento                         JWT             ALL
/payout/me                                  GET         Ler meus pagamentos                              JWT             MOTOBOY
/payout?key=value                           GET         Ler todos os pagamentos                          JWT             ALL
/payout/:uuid                               GET         Ler pagamento                                    JWT             ALL
/payout/:uuid                               PATCH       Atualizar pagamento                              JWT             ADMIN/OPERATOR
/payout/:uuid/code                          PATCH       Atualizar campo "código do estabelecimento"      JWT             ADMIN
/payout/:uuid/:bool                         PATCH       Atualizar campo "está fechado"                   JWT             ADMIN
/payout/:uuid                               DELETE      Apagar pagamento                                 JWT             ADMIN/OPERATOR

/settlement                                 POST        Criar caixa para um televendas                   JWT             ADMIN/OPERATOR
/settlement/preview?key=value               GET         Pré-visualizar caixa                             JWT             ADMIN/OPERATOR
/settlement/me                              GET         Ler meus caixas                                  JWT             ADMIN/OPERATOR
/settlement?key=value                       GET         Ler todos os caixas                              JWT             ADMIN/OPERATOR
/settlement/:uuid                           GET         Ler caixa                                        JWT             ADMIN/OPERATOR
/settlement/:uuid                           PATCH       Atualizar caixa                                  JWT             ADMIN/OPERATOR
/settlement/:uuid/code                      PATCH       Atualizar campo "código do estabelecimento"      JWT             ADMIN
/settlement/:uuid/:bool                     PATCH       Atualizar campo "está fechado"                   JWT             ADMIN
/settlement/:uuid                           DELETE      Apagar caixa                                     JWT             ADMIN/OPERATOR
```

Obs.: Rotas que contém 'me' usam os dados do usuário que vem por meio do objeto
da requisição.
