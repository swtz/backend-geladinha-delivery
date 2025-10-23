import { Injectable, Logger } from '@nestjs/common';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { generateBadRequestException } from 'src/common/generate-exception';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);

  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

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
