# Request <-> Response

http://localhost:3000/deliveries -> 80 HTTP ou 443 HTTPS

O http é o esquema (HTTP, HTTPS, FTP, etc), localhost é o host (google.com,
iamsolame.shop, etc), 3000 é a porta TCP usada para a conexão, e /deliveries é o
path, o caminho do recurso.

```
Ler   Criar  Atualizar     Apagar
GET / POST / PATCH / PUT / DELETE / HEAD / OPTIONS / CONNECT / TRACE

/auth/login          POST        autenticar usuário      Aberta

/user/              POST        Criar usuário           Aberta
/user/me            GET         Ler usuário             JWT
/user/me            PATCH       Atualizar usuário       JWT
/user/me/password   PATCH       Atualizar senha         JWT
```
