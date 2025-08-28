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
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: CreateVoucherDto, user: User) {
    const entity = await this.userService.findOneByOrFail({ id: user.id });
    const voucher = {
      amount: dto.amount,
      description: dto.description,
    };
    const created = await this.save(voucher);

    entity.vouchers.push(created);

    await this.userService.save(entity);
    return {
      ...created,
      entity,
    };
  }

  async createForEntity(dto: CreateVoucherDto, user: User, id: string) {
    const newVoucher = {
      amount: dto.amount,
      description: dto.description,
    };

    const authFlags = await this.authService.getUserAndEntityAuth(user, id);

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

    await this.userService.save(entity);

    const voucher = await this.findOneByOrFail({ id: created.id });

    voucher.createdBy = user;
    await this.save(voucher);

    return voucher;
  }

  async updateForEntity(dto: UpdateVoucherDto, user: User, entityId: string) {
    // TODO: fazer lógica para checar 'createdBy'
    // e controlar quem pode ou não atualizar tais dados

    // userService.findOneByOrFail({id: entityId}) → entity
    const authFlags = await this.authService.getUserAndEntityAuth(
      user,
      entityId,
    );
    // this.findOneOwnedByOrFail({id: dto.id}, entity.id) → voucher
    const voucher = authFlags.entity.vouchers.find(
      voucher => voucher.id === dto.id,
    );

    if (!voucher) {
      throw new NotFoundException('Compra ou vale não existe');
    }

    // isAdmin → this.update(dto, entity, voucher)
    if (authFlags.isLoggedUserAdmin) {
      return this.update(dto, authFlags.entity, voucher.id);
    }

    // if (!isLoggedUserOperator || !isEntityMotoboy) → 401
    if (!authFlags.isLoggedUserOperator || !authFlags.isEntityMotoboy) {
      throw new UnauthorizedException(
        'Só é possível atualizar compras ou vales para os motoboys',
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
      relations: ['user', 'createdBy'],
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
      relations: ['user', 'createdBy'],
    });
  }

  // async findOneByDeliveryMan(
  //   voucherData: Partial<Voucher>,
  //   user: User | DeliveryMan,
  // ) {
  //   if (user instanceof DeliveryMan) {
  //     return this.findOneOwnedOrFail(voucherData, user);
  //   }

  //   const voucher = await this.findOneOrFail(voucherData);
  //   const deliveryMan = await this.deliveryManService.findOneOrFail({
  //     id: voucher.deliveryMan.id,
  //   });

  //   return this.findOneOwnedOrFail({ id: voucher.id }, deliveryMan);
  // }

  // async findOneOwnedOrFail(
  //   voucherData: Partial<Voucher>,
  //   motoboy: DeliveryMan,
  // ) {
  //   const voucher = await this.voucherRepository.findOne({
  //     where: {
  //       ...voucherData,
  //       deliveryMan: { id: motoboy.id },
  //     },
  //     relations: ['deliveryMan'],
  //   });

  //   if (!voucher) {
  //     throw new NotFoundException('Compra ou vale não encontrado');
  //   }

  //   return voucher;
  // }

  // async findAllOwned(motoboyData: Partial<DeliveryMan>) {
  //   const vouchers = await this.voucherRepository.find({
  //     where: {
  //       deliveryMan: motoboyData,
  //     },
  //     order: { createdAt: 'DESC' },
  //     relations: ['deliveryMan'],
  //   });

  //   return vouchers;
  // }

  // async findAll() {
  //   const vouchers = await this.voucherRepository.find({
  //     order: { createdAt: 'DESC' },
  //     relations: ['deliveryMan'],
  //   });

  //   return vouchers;
  // }

  // async remove(id: string, user: User | DeliveryMan) {
  //   const voucher = await this.findOneByDeliveryMan({ id }, user);

  //   await this.voucherRepository.delete({ id });
  //   return voucher;
  // }

  async save(voucher: Partial<Voucher>) {
    const created = await this.voucherRepository
      .save(voucher)
      .catch((err: unknown) => {
        if (err instanceof Error) {
          this.logger.error('Erro ao criar a compra/vale', err.stack);
        }

        throw new BadRequestException('Erro ao criar a compra/vale');
      });

    return created;
  }
}
