import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Place } from '../entities/place.entity';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsOrderValue,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { AddressService } from 'src/address/address.service';
import { User } from 'src/user/entities/user.entity';
import { UpdatePlaceDto } from '../dto/update-place.dto';
import { WorkTimeService } from 'src/work-time/services/work-time.service';
import { DataSource } from 'typeorm';
import { WorkTime } from 'src/work-time/entities/work-time.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly addressService: AddressService,
    private readonly workTimeService: WorkTimeService,
    private readonly dataSource: DataSource,
  ) {}

  async failIfExists(field: string, value: string) {
    if (!field || !value) return undefined;

    const exists = await this.placeRepository.existsBy({ [field]: value });
    if (exists) {
      throw new ConflictException(
        `Esse ${field.toUpperCase()} já existe na base de dados do sistema`,
      );
    }
  }

  async create(dto: CreatePlaceDto, owner: User) {
    return this.dataSource.transaction(async manager => {
      const address = await this.addressService.create(
        dto.address,
        true,
        manager,
      );
      const postalBox = dto.postalBox
        ? await this.addressService.create(dto.postalBox, true, manager)
        : address;
      const workTime = await this.workTimeService.create(
        dto.workTime,
        true,
        manager,
      );
      const place = {
        ...dto,
        code: dto.code, // método específico para definir essa propriedade
        owners: [owner],
        address,
        postalBox,
        workTimes: [workTime],
      };
      const created = await this.save(place, manager);
      return this.findOneByOrFail({ id: created.id }, manager);
    });
  }

  async update(place: Place, dto: UpdatePlaceDto) {
    return this.dataSource.transaction(async manager => {
      place.name = dto.name ?? place.name;
      place.businessName = dto.businessName ?? place.businessName;
      place.phone = dto.phone ?? place.phone;
      place.secondPhone = dto.secondPhone ?? place.secondPhone;
      place.email = dto.email ?? place.email;
      place.cpf = dto.cpf ?? place.cpf;
      place.cnpj = dto.cnpj ?? place.cnpj;

      const updated = await this.save(place, manager);
      return this.findOneByOrFail({ id: updated.id }, manager);
    });
  }

  async updateCode(place: Place, code: string) {
    await this.failIfExists('code', code);
    const updated = await this.placeRepository.save({ ...place, code });
    return this.findOneByOrFail({ id: updated.id });
  }

  async findOneByOrFail(placeData: Partial<Place>, manager?: EntityManager) {
    const place = await this.findOneBy(placeData, manager);

    if (!place) {
      throw new NotFoundException('Esse estabelecimento não existe.');
    }

    return place;
  }

  async findOneBy(placeData: Partial<Place>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Place) : this.placeRepository;
    return repo.findOne({
      where: placeData,
      relations: {
        owners: true,
        address: true,
        postalBox: true,
        workTimes: true,
      },
    });
  }

  async findAll(
    {
      userData,
      workTimeData,
    }: Partial<Place> & {
      workTimeData?: Omit<Partial<WorkTime>, 'user'> & {
        user?: Partial<User>[];
      };
      userData?: Partial<User>;
    },
    orderParams?: {
      [K in keyof FindOptionsOrder<Place>]: FindOptionsOrderValue;
    },
  ) {
    return this.placeRepository.find({
      where: {
        owners: userData ? [userData] : undefined,
        workTimes: workTimeData ? [workTimeData] : undefined,
      },
      order: orderParams,
      relations: {
        owners: true,
        workTimes: true,
      },
    });
  }

  async remove(id: string, user: User, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Place) : this.placeRepository;
    const place = await this.findOneByOrFail({ id }, manager);

    if (place.code === process.env.DEFAULT_PLACE_CODE) {
      throw new UnauthorizedException(
        'Não é possível remover o estabelecimento padrão',
      );
    }

    const isOwner = place.owners.some(item => item.id === user.id);

    if (!isOwner) {
      throw new UnauthorizedException('Acesso negado');
    }

    await repo.delete({ id });
    return place;
  }

  async save(place: Partial<Place>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Place) : this.placeRepository;
    return repo.save(place);
  }
}
