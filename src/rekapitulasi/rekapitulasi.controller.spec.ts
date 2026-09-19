import { Test, TestingModule } from '@nestjs/testing';
import { RekapitulasiController } from './rekapitulasi.controller';

describe('RekapitulasiController', () => {
  let controller: RekapitulasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RekapitulasiController],
    }).compile();

    controller = module.get<RekapitulasiController>(RekapitulasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
