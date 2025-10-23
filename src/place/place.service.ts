import { Injectable, Logger } from '@nestjs/common';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateBadRequestException } from 'src/common/generate-exception';
import { CreatePlaceDto } from './dto/place/create-place.dto';
import { AddressService } from 'src/address/address.service';
import { WorkTimeService } from './services/work-time.service';
import { User } from 'src/user/entities/user.entity';
import { PlaceType } from './types/place';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);

  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly addressService: AddressService,
    private readonly workTimeService: WorkTimeService,
  ) {}

  async create(dto: CreatePlaceDto, user: User) {
    // obter usuário
    const owner = user;

    // validar documentos
    const cpf = dto.cpf;
    const cnpj = dto.cnpj;

    // criar endereço
    const address = await this.addressService.create(dto.address);
    // criar caixa postal
    const postalBox = dto.postalBox
      ? await this.addressService.create(dto.postalBox)
      : address;

    // criar um work time
    const workTime = await this.workTimeService.create(dto.workTime);

    // criar um social medias (ainda não)
    // depois cria-se o objeto
    const place: PlaceType = {
      name: dto.name,
      businessName: dto.businessName,
      cnpj,
      cpf,
      phone: dto.phone,
      secondPhone: dto.secondPhone ?? dto.phone,
      email: dto.email,
      address,
      postalBox,
      workTimes: [workTime],
      owners: [owner],
    };

    const created = this.placeRepository.create(place);
    return created;
  }

  async save(placeData: Partial<Place>) {
    const http400 = generateBadRequestException(
      'Erro ao salvar o estabelecimento',
    );
    const created = await this.placeRepository
      .save(placeData)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
