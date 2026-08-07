# Observações Diárias (7/8/2026) MANHÃ DE SEXTA

## Place Entity

→ Objetivo: quero que o CNPJ da Place esteja inserido em entidades que precisam
estar relacionadas a ela.

→ Vantagens: posso filtrar todas as instâncias de tal entidade com base nesse
campo.

→ Tipo do campo: string ou Place ? → Place envolve questões de
"circular-dependency" (e etc) daí pensei em registrar apenas uma informação
única do estabelecimento tal como o cpf ou cnpj ou até mesmo o id.

→ Fluxo de uso para criar as entidades: → User → create() basta adicionar
CreateUserDto.placeCode

Obs.: no Frontend, esse campo será usado em todas as requisições que envolvem a
presença de Place, isto é, que as informações precisem ser filtradas e ordenadas
com base nesse campo.

Nota: Essa informação ficará OMISSA no Frontend, ou seja, o sistema usará ela de
modo interno não a deixando vazar na tela de modo que qualquer um possa olhar.
