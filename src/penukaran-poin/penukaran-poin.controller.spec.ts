import { Test, TestingModule } from '@nestjs/testing';
import { PenukaranPoinController } from './penukaran-poin.controller';

describe('PenukaranPoinController', () => {
  let controller: PenukaranPoinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenukaranPoinController],
    }).compile();

    controller = module.get<PenukaranPoinController>(PenukaranPoinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
