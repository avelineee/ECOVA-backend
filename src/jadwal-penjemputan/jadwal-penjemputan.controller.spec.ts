import { Test, TestingModule } from '@nestjs/testing';
import { JadwalPenjemputanController } from './jadwal-penjemputan.controller';

describe('JadwalPenjemputanController', () => {
  let controller: JadwalPenjemputanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JadwalPenjemputanController],
    }).compile();

    controller = module.get<JadwalPenjemputanController>(JadwalPenjemputanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
