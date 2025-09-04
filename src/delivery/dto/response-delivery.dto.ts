// import { DeliveryEntity } from '../entities/delivery.entity';

// export class ResponseDeliveryDto {
//   readonly id: string;
//   readonly name: string;
//   readonly paymentMethod: string;
//   readonly totalPurchase: number;
//   readonly deliveryTax: number;
//   readonly paid: boolean;
//   readonly createdAt: Date;
//   readonly updatedAt: Date;
//   readonly operator: {
//     id: string;
//     name: string;
//     email: string;
//   } | null;
//   readonly motoboy: {
//     id: string;
//     name: string;
//     phone: string;
//     motorcycle: string;
//   } | null;

//   constructor(delivery: DeliveryEntity) {
//     this.id = delivery.id;
//     this.name = delivery.name;
//     this.paymentMethod = delivery.paymentMethod;
//     this.totalPurchase = delivery.totalPurchase;
//     this.deliveryTax = delivery.deliveryTax;
//     this.paid = delivery.paid;
//     this.createdAt = delivery.createdAt;
//     this.updatedAt = delivery.updatedAt;
//     this.operator = {
//       id: delivery.operator?.id,
//       name: delivery.operator?.name,
//       email: delivery.operator?.email,
//     };
//     this.motoboy = {
//       id: delivery.motoboy?.id,
//       name: delivery.motoboy?.name,
//       phone: delivery.motoboy?.phone,
//       motorcycle: delivery.motoboy?.motorcycle,
//     };
//   }
// }
