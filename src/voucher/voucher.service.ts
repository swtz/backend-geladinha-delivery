import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Voucher } from './entities/voucher.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { User } from 'src/user/entities/user.entity';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { setDecimalPlaces } from 'src/common/utils/set-decimal-places';
import relations from './data/relations/voucher';
import {
  FindAllParams,
  VoucherFindAllFactory,
} from './factories/query-factory';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateVoucherDto, user: User) {
    const entity = await this.userService.findOneByOrFail({ id: user.id });
    const voucher = {
      amount: dto.amount,
      description: dto.description,
      user: entity,
    };
    const created = await this.save(voucher);

    return this.findOneOwnedByOrFail({ id: created.id }, entity);
  }

  async createForEntity(dto: CreateVoucherDto, user: User, id: string) {
    const newVoucher = {
      amount: dto.amount,
      description: dto.description,
    };

    const authFlags = await this.userService.getUserAndEntityAuth(user, id);

    if (authFlags.isLoggedUserAdmin) {
      return this.pushToEntity(authFlags.entity, user, newVoucher);
    }

    if (!authFlags.isLoggedUserOperator || !authFlags.isEntityMotoboy) {
      throw new UnauthorizedException(
        'Só é possível criar compras ou vales para os motoboys',
      );
    }

    const motoboy = await this.userService.findOneMotoboyByOrFail({ id });
    return this.pushToEntity(motoboy, user, newVoucher);
  }

  async pushToEntity(entity: User, user: User, newVoucher: Partial<Voucher>) {
    const created = await this.save(newVoucher);

    entity.vouchers.push(created);

    await this.userService.saveUser(entity);

    const voucher = await this.findOneByOrFail({ id: created.id });

    voucher.createdBy = user;
    await this.save(voucher);

    return voucher;
  }

  async updateForEntity(dto: UpdateVoucherDto, user: User, entityId: string) {
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
    );

    if (voucher.createdBy !== null && user.id !== voucher.createdBy.id) {
      throw new UnauthorizedException(
        `Somente o usuário ${voucher.createdBy.name} pode alterar essa compra ou vale`,
      );
    }

    if (authFlags.isLoggedUserAdmin) {
      return this.update(dto, authFlags.entity, voucher.id);
    }

    if (!authFlags.isEntityMotoboy) {
      throw new UnauthorizedException(
        'Só é possível atualizar compras ou vales dos motoboys',
      );
    }

    const motoboy = await this.userService.findOneMotoboyByOrFail({
      id: entityId,
    });

    return this.update(dto, motoboy, voucher.id);
  }

  async update(dto: UpdateVoucherDto, user: User, voucherId: string) {
    if (!dto.amount && !dto.description) {
      throw new BadRequestException('Dados não enviados');
    }

    const voucher = await this.findOneOwnedByOrFail({ id: voucherId }, user);

    voucher.amount = dto.amount ?? voucher.amount;
    voucher.description = dto.description ?? voucher.description;

    return this.save(voucher);
  }

  async findOneByOrFail(voucherData: Partial<Voucher>) {
    const voucher = await this.findOneBy(voucherData);

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não encontrado');
    }

    return voucher;
  }

  findOneBy(voucherData: Partial<Voucher>) {
    return this.voucherRepository.findOne({
      where: voucherData,
      relations,
    });
  }

  async findOneOwnedByOrFail(voucherData: Partial<Voucher>, user: User) {
    const voucher = await this.findOneOwnedBy(voucherData, user);

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não encontrado');
    }

    return voucher;
  }

  findOneOwnedBy(voucherData: Partial<Voucher>, user: User) {
    return this.voucherRepository.findOne({
      where: {
        ...voucherData,
        user: { id: user.id },
      },
      relations,
    });
  }

  async findByUser(id: string) {
    const vouchers = await this.voucherRepository.find({
      where: {
        user: { id },
      },
      order: { createdAt: 'DESC' },
      relations,
    });

    return vouchers;
  }

  async findAllOwned(queryParams: FindAllParams) {
    const factory = new VoucherFindAllFactory();
    const queryObject = factory.factoryMethod(queryParams);

    const vouchers = await this.voucherRepository.find({
      where: queryObject,
      order: { createdAt: 'DESC' },
      relations,
    });

    return vouchers;
  }

  async sum(queryParams: FindAllParams) {
    const factory = new VoucherFindAllFactory();
    const queryObject = factory.factoryMethod(queryParams);

    const total = await this.voucherRepository.sum('amount', queryObject);

    if (!total) {
      return 0;
    }

    return setDecimalPlaces(total, 2);
  }

  async remove(id: string, user: User) {
    const voucher = await this.findOneByOrFail({ id });
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

      await this.voucherRepository.delete({ id });
      return voucher;
    }

    if (voucher.user.id !== user.id) {
      if (
        authFlags.isLoggedUserAdmin ||
        (authFlags.isEntityMotoboy && authFlags.isLoggedUserOperator)
      ) {
        await this.voucherRepository.delete({ id });
        return voucher;
      }

      throw new UnauthorizedException(
        `Somente o usuário ${authFlags.entity.name} pode excluir essa compra ou vale`,
      );
    }

    await this.voucherRepository.delete({ id });
    return voucher;
  }

  async save(voucher: Partial<Voucher>) {
    const http400 = generateBadRequestException('Erro ao salvar a compra/vale');
    const created = await this.voucherRepository
      .save(voucher)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error(http400.message, err.stack);
        }

        throw http400;
      });

    return created;
  }
}
