## Algumas Regras do Software DECK DA PRAIA Delivery

→ funcionalidade de referência:
DeliveryManMotorcycleService.updateRestrictMotorcycle(id: string, dto:
UpdateMotorcycleDto)

Eis aí uma combinação de dois fatores: 1 - parâmetro dto do tipo update, isto é,
TODAS AS PROPRIEDADES SÃO OPCIONAIS 2 - o método usa services os quais fazem
buscas usando o método `findOne`

Ou seja, se TODAS ou SE A propriedade tiver um valor de 'undefined', o TypeORM
retornará o PRIMEIRO REGISTRO da entidade na base de dados.

Por isso, deve-se prestar muita atenção quando essas duas combinações
aparecerem!

Soluções:

1. operador ternário → impede que a variável contendo 'undefined' seja usada na
   query

2. validateFindOneParamsOrFail<T>(dto: T, idFromDto: boolean): Partial<T> → essa
   função (que o ChatGPT me auxiliou a criar) valida se ao menos alguma
   propriedade do 'arg0' tem valor diferente de 'undefined'. em caso negativo, é
   lançada uma exceção, assim impedindo o retorno de uma informação imprecisa.

## Alguns códigos-guia para implementar métodos comuns na aplicação:

### FindAll

```ts
@Get()
async findAll(
  @Query('workTimeId', new ParseUUIDPipe({ optional: true }))
  workTimeId: string,
  @Query('userId', new ParseUUIDPipe({ optional: true })) userId: string,
  @Query('duration') duration: string,
  @Query('field')
  field: 'createdAt' | 'updatedAt' | 'initHour' | 'endHour' | 'duration',
  @Query('order') order: 'asc' | 'desc' | 'ASC' | 'DESC',
) {
  const intervalTimes = await this.intervalTimeService.findAll(
    {
      duration,
      workTime: { id: workTimeId },
      user: { id: userId },
    },
    { [field]: order },
  );
  const parsedIntervalTimes = intervalTimes.map(
    item => new ResponseIntervalTimeDto(item),
  );

  return parsedIntervalTimes;

}
```

### FindOneBy

```ts
  @Get('find')
  async findOneBy(
    @Query('id', new ParseUUIDPipe({ optional: true })) id: string,
    @Query('nickname') nickname: string,
    @Query('name') name: string,
    @Query('lastName') lastName: string,
    @Query('email', ParseEmailPipe) email: string,
    @Query('phone', ParseBrPhonePipe) phone: string,
    @Query('secondPhone', ParseBrPhonePipe) secondPhone: string,
  ) {
    validateFindOneParamsOrFail<Partial<Customer>>({
      id,
      nickname,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    });

    const customer = await this.customerService.findOneByOrFail({
      id,
      nickname,
      name,
      lastName,
      email,
      phone,
      secondPhone,
    });

    return new ResponseCustomerDto(customer);
  }
```
