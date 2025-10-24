import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateBadRequestException } from 'src/common/generate-exception';
import { CreatePlaceDto } from './dto/place/create-place.dto';
import { AddressService } from 'src/address/address.service';
import { WorkTimeService } from './services/work-time.service';
import { User } from 'src/user/entities/user.entity';
import { PlaceType } from './types/place';
import { CreateWorkTimeDto } from './dto/work-time/create-work-time.dto';

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
      code: dto.code,
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

    const created = await this.save(place);
    return this.findOneByOrFail({ id: created.id });
  }

  async findOneByOrFail(placeData: Partial<Place>) {
    const place = await this.findOneBy(placeData);

    if (!place) {
      throw new NotFoundException('Esse estabelecimento não existe.');
    }

    return place;
  }

  async findOneBy(placeData: Partial<Place>) {
    return this.placeRepository.findOne({
      where: placeData,
      relations: {
        owners: true,
        address: true,
        postalBox: true,
        workTimes: true,
        socialMedias: true,
      },
    });
  }

  async addWorkTime(dto: CreateWorkTimeDto, id: string) {
    if (dto.isDefault === undefined || dto.isDefault === null) {
      throw new BadRequestException(
        'Campo horário padrão não pode estar vazio',
      );
    }

    const place = await this.findOneByOrFail({ id });

    if (place.workTimes.length >= 5) {
      throw new BadRequestException(
        'Só é possível cadastrar 5 horários por estabelecimento',
      );
    }

    if (dto.isDefault) {
      const workTimes = place.workTimes.filter(item => item.isDefault === true);

      if (workTimes.length > 0) {
        const defaultWorkTime = workTimes[0];
        await this.workTimeService.save({
          ...defaultWorkTime,
          isDefault: false,
        });
      }
    }

    const workTime = await this.workTimeService.findOneOrCreate(dto.shift, dto);
    place.workTimes.push(workTime);
    await this.save(place);

    return this.findOneByOrFail({ id });
  }

  async removeWorkTime(id: string) {
    const workTime = await this.workTimeService.findOneByOrFail({ id });

    if (workTime.isDefault) {
      throw new BadRequestException(
        'Não é possível excluir o horário que está como padrão',
      );
    }

    if (workTime.places.length > 0) {
      const { places } = workTime;

      places.forEach(item => {
        if (item.workTimes.length === 1) {
          throw new BadRequestException(
            `${item.businessName} precisa ter ao menos 1 horário`,
          );
        }
      });
    }

    // return this.workTimeService.remove(id);
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
