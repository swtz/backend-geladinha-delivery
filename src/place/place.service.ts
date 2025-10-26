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
import { UpdatePlaceDto } from './dto/place/update-place.dto';

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
    const workTime = await this.workTimeService.findOneOrCreate(
      dto.workTime.shift,
      dto.workTime,
    );

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

  async update(id: string, dto: UpdatePlaceDto) {
    const place = await this.findOneByOrFail({ id });

    // unique
    place.name = dto.name ?? place.name;
    place.phone = dto.phone ?? place.phone;
    place.email = dto.email ?? place.email;
    place.cpf = dto.cpf ?? place.cpf;
    place.cnpj = dto.cnpj ?? place.cnpj;
    place.secondPhone = dto.secondPhone ?? place.secondPhone;

    // custom
    place.businessName = dto.businessName ?? place.businessName;
    place.code = dto.code ?? place.code;

    // entities
    // place.address
    // if dto.address → dto.address.id ? findOne : create
    if (dto.address) {
      if (dto.address.id) {
        place.address = await this.addressService.findOneByOrFail({ id });
      } else {
        place.address = await this.addressService.create(dto.address);
      }
    }
    // place.postalBox
    if (dto.postalBox) {
      if (dto.postalBox.id) {
        place.postalBox = await this.addressService.findOneByOrFail({ id });
      } else {
        place.postalBox = await this.addressService.create(dto.postalBox);
      }
    }
    // place.owners
    // place.workTimes

    const updated = await this.save(place);
    return this.findOneByOrFail({ id: updated.id });
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

    this.workTimeService.failIfShiftExistsInPlace(place, dto.shift);

    if (place.workTimes.length >= 5) {
      throw new BadRequestException(
        'Só é possível cadastrar 5 horários por estabelecimento',
      );
    }

    if (dto.isDefault) {
      const defaultWorkTime = this.workTimeService.findDefaultFromPlace(place);
      const workTime = await this.workTimeService.findOneOrCreate(
        dto.shift,
        dto,
      );

      if (defaultWorkTime) {
        await this.workTimeService.save({
          ...defaultWorkTime,
          isDefault: false,
        });
      }

      place.workTimes.push(workTime);

      await this.save(place);
      return this.findOneByOrFail({ id });
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

    return this.workTimeService.remove(id);
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
