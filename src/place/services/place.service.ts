import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Place } from '../entities/place.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateBadRequestException } from 'src/common/generate-exception';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { AddressService } from 'src/address/address.service';
import { User } from 'src/user/entities/user.entity';
import { PlaceType } from '../types/place.type';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { WorkTimeService } from 'src/work-time/work-time.service';
import { UserService } from 'src/user/services/user.service';
import { CreateWorkTimeDto } from 'src/work-time/dto/create-work-time.dto';
import { Shift } from 'src/common/enums/work-shifts.enum';
import { UpdateWorkTimeDto } from 'src/work-time/dto/update-work-time.dto';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);

  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly addressService: AddressService,
    private readonly workTimeService: WorkTimeService,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreatePlaceDto, user: User) {
    // obter usuário
    const owner = user;

    // validar documentos
    const cpf = dto.cpf; // failIfExists
    const cnpj = dto.cnpj; // failIfExists

    // criar endereço
    const address = await this.addressService.create(dto.address);
    // criar caixa postal
    const postalBox = dto.postalBox
      ? await this.addressService.create(dto.postalBox)
      : address;

    // criar um work time
    // const workTime = await this.workTimeService.findOneOrCreate(
    //   dto.workTime,
    //   dto.workTime.isDefault,
    //   true,
    // );

    // criar um social medias (ainda não)
    // depois cria-se o objeto
    const place = {
      code: dto.code, // failIfExists
      name: dto.name, // failIfExists
      businessName: dto.businessName,
      cnpj,
      cpf,
      phone: dto.phone, // failIfExists
      secondPhone: dto.secondPhone ?? dto.phone,
      email: dto.email, // failIfExists
      address,
      postalBox,
      // workTimes: [workTime],
      owners: [owner],
    };

    const created = await this.save(place);
    return this.findOneByOrFail({ id: created.id });
  }

  async update(id: string, dto: UpdatePlaceDto) {
    const place = await this.findOneByOrFail({ id });

    // unique
    place.code = dto.code ?? place.code;
    place.name = dto.name ?? place.name;
    place.phone = dto.phone ?? place.phone;
    place.email = dto.email ?? place.email;
    place.cpf = dto.cpf ?? place.cpf;
    place.cnpj = dto.cnpj ?? place.cnpj;
    place.secondPhone = dto.secondPhone ?? place.secondPhone;

    // custom
    place.businessName = dto.businessName ?? place.businessName;

    // place.owners
    if (dto.ownerId) {
      const owner = await this.userService.findOneByOrFail({ id: dto.ownerId });
      place.owners.push(owner);
    }

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

    // place.workTimes
    // Os horários serão atualizados por meio de uma rota
    // específica do WorkTimeController, por conta da
    // flag isShared

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

  async findAll(
    queryParams: Partial<Place> & {
      ownName: string;
      ownPhone: string;
      ownId: string;
      shift: Shift;
      isDefault: boolean;
    },
  ) {
    const {
      ownName: name,
      ownPhone: phone,
      ownId: id,
      shift,
      isDefault,
    } = queryParams;
    return this.placeRepository.find({
      where: {
        businessName: queryParams.businessName,
        workTimes: [{ shift, isDefault }],
        owners: [{ name, phone, id }],
      },
      order: { createdAt: 'DESC' },
      relations: {
        owners: true,
      },
    });
  }

  async addWorkTime(dto: CreateWorkTimeDto, id: string) {
    const place = await this.findOneByOrFail({ id });
    await this.workTimeService.create(dto);
    return this.findOneByOrFail({ id: place.id });
  }

  async updateSharedWorkTime(dto: UpdateWorkTimeDto, id: string, user: User) {
    const place = await this.findOneByOrFail({ id });
    await this.workTimeService.updateShared(id, dto, user);
    return this.findOneByOrFail({ id: place.id });
  }

  async removeWorkTime(id: string, workTimeId: string, user: User) {
    const place = await this.findOneByOrFail({ id });
    await this.workTimeService.removeShared(id, workTimeId, user);
    return this.findOneByOrFail({ id: place.id });
  }

  async remove(id: string, user: User) {
    const place = await this.findOneByOrFail({ id });

    if (place.code === process.env.DEFAULT_PLACE_CODE) {
      throw new UnauthorizedException(
        'Não é possível remover o estabelecimento padrão',
      );
    }

    const isOwner = place.owners.some(item => item.id === user.id);

    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }

    await this.placeRepository.delete({ id });
    return place;
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
