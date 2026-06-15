import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { Voucher } from './entities/voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/services/user.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import relations from './data/relations/voucher';
import {
  FindAllParams,
  VoucherFindAllFactory,
} from './factories/query-factory';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateVoucherDto, user: User, manager?: EntityManager) {
    const entity = await this.userService.findOneByOrFail(
      { id: user.id },
      undefined,
      manager,
    );
    const voucher = {
      amount: dto.amount,
      description: dto.description,
      user: entity,
    };
    const created = await this.save(voucher, manager);

    return this.findOneOwnedByOrFail({ id: created.id }, entity, manager);
  }

  async createForEntity(
    dto: CreateVoucherDto,
    user: User,
    id: string,
    manager?: EntityManager,
  ) {
    if (!id) {
      throw new BadRequestException('O ID do usuário é obrigatório');
    }

    const entity = await this.userService.findOneByOrFail(
      { id },
      'motoboy-essencial',
      manager,
    );
    const { isLoggedUserAdmin } = await this.userService.getUserAndEntityAuth(
      user,
      id,
    );
    const voucher = {
      amount: dto.amount,
      description: dto.description,
      user: entity,
      createdBy: user,
    };

    if (voucher.user.deliveryMan) {
      return this.save(voucher, manager);
    }

    if (isLoggedUserAdmin) {
      return this.save(voucher, manager);
    }

    throw new UnauthorizedException(
      'Só é possível criar compras ou vales para os motoboys',
    );
  }

  async updateForEntity(
    dto: UpdateVoucherDto,
    user: User,
    entityId: string,
    manager?: EntityManager,
  ) {
    if (!dto.id) {
      throw new BadRequestException('Campo ID não pode estar vazio');
    }

    const authFlags = await this.userService.getUserAndEntityAuth(
      user,
      entityId,
    );
    const voucher = await this.findOneOwnedByOrFail(
      { id: dto.id },
      authFlags.entity,
      manager,
    );

    if (voucher.createdBy !== null && user.id !== voucher.createdBy.id) {
      throw new UnauthorizedException(
        `Somente o usuário ${voucher.createdBy.name} pode alterar essa compra ou vale`,
      );
    }

    if (authFlags.isLoggedUserAdmin) {
      return this.update(dto, authFlags.entity, voucher.id, manager);
    }

    if (!authFlags.isEntityMotoboy) {
      throw new UnauthorizedException(
        'Só é possível atualizar compras ou vales dos motoboys',
      );
    }

    return this.update(dto, authFlags.entity, voucher.id, manager);
  }

  async update(
    dto: UpdateVoucherDto,
    user: User,
    voucherId: string,
    manager?: EntityManager,
  ) {
    const voucher = await this.findOneOwnedByOrFail(
      { id: voucherId },
      user,
      manager,
    );

    voucher.amount = dto.amount ?? voucher.amount;
    voucher.description = dto.description ?? voucher.description;

    return this.save(voucher, manager);
  }

  async findOneByOrFail(
    voucherData: Partial<Voucher>,
    manager?: EntityManager,
  ) {
    const voucher = await this.findOneBy(voucherData, manager);

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não encontrado');
    }

    return voucher;
  }

  findOneBy(voucherData: Partial<Voucher>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Voucher)
      : this.voucherRepository;
    return repo.findOne({
      where: voucherData,
      relations,
    });
  }

  async findOneOwnedByOrFail(
    voucherData: Partial<Voucher>,
    user: User,
    manager?: EntityManager,
  ) {
    const voucher = await this.findOneOwnedBy(voucherData, user, manager);

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não encontrado');
    }

    return voucher;
  }

  async findOneOwnedBy(
    voucherData: Partial<Voucher>,
    user: User,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Voucher)
      : this.voucherRepository;
    return repo.findOne({
      where: {
        ...voucherData,
        user: { id: user.id },
      },
      relations,
    });
  }

  async findAll(queryParams: FindAllParams) {
    const factory = new VoucherFindAllFactory();
    const queryObject = factory.factoryMethod(queryParams);

    const vouchers = await this.voucherRepository.find({
      where: queryObject,
      order: { createdAt: 'DESC' },
      relations,
    });

    return vouchers;
  }

  async sum(queryParams: FindAllParams, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Voucher)
      : this.voucherRepository;
    const factory = new VoucherFindAllFactory();
    const queryObject = factory.factoryMethod(queryParams);

    const total = await repo.sum('amount', queryObject);

    if (!total) {
      return 0;
    }

    return setDecimalPlaces(total, 2);
  }

  async remove(id: string, user: User, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Voucher)
      : this.voucherRepository;
    const voucher = await this.findOneByOrFail({ id }, manager);
    const haveCreatedBy = voucher.createdBy !== null;
    const entityId = haveCreatedBy ? voucher.createdBy.id : voucher.user.id;
    const authFlags = await this.userService.getUserAndEntityAuth(
      user,
      entityId,
    );

    if (haveCreatedBy) {
      if (voucher.createdBy.id !== user.id) {
        throw new UnauthorizedException(
          `Somente o usuário ${authFlags.entity.name} pode excluir essa compra ou vale`,
        );
      }

      await repo.delete({ id });
      return voucher;
    }

    if (voucher.user.id !== user.id) {
      if (
        authFlags.isLoggedUserAdmin ||
        (authFlags.isEntityMotoboy && authFlags.isLoggedUserOperator)
      ) {
        await repo.delete({ id });
        return voucher;
      }

      throw new UnauthorizedException(
        `Somente o usuário ${authFlags.entity.name} pode excluir essa compra ou vale`,
      );
    }

    await repo.delete({ id });
    return voucher;
  }

  async save(voucher: Partial<Voucher>, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Voucher)
      : this.voucherRepository;
    return repo.save(voucher);
  }
}
