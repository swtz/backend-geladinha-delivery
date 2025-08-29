import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryModule } from './delivery/delivery.module';
import { VoucherModule } from './voucher/voucher.module';
import { CustomerModule } from './customer/customer.module';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    VoucherModule,
    CustomerModule,
    DeliveryModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (process.env.DB_TYPE === 'better-sqlite3') {
          return {
            type: process.env.DB_TYPE,
            database: process.env.DB_DATABASE || './db.sqlite',
            synchronize: true,
            autoLoadEntities: true,
          };
        }

        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    AddressModule,
  ],
})
export class AppModule {}
