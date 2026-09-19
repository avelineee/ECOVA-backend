import { Test, TestingModule } from '@nestjs/testing';
import { SetorSampahController } from './setor-sampah.controller';

describe('SetorSampahController', () => {
  let controller: SetorSampahController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetorSampahController],
    }).compile();

    controller = module.get<SetorSampahController>(SetorSampahController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
