import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export async function setEntityRelationFieldAsNull<T extends ObjectLiteral>(
  entityTarget: EntityTarget<T>,
  propertyPath: string,
  entityId: string,
  manager: EntityManager | Repository<T>,
) {
  await manager
    .createQueryBuilder()
    .relation(entityTarget, propertyPath)
    .of(entityId)
    .set(null);
}
