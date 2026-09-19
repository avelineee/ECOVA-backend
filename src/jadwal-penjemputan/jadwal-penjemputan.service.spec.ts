import { Test, TestingModule } from '@nestjs/testing';
import { JadwalPenjemputanService } from './jadwal-penjemputan.service';

describe('JadwalPenjemputanService', () => {
  let service: JadwalPenjemputanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JadwalPenjemputanService],
    }).compile();

    service = module.get<JadwalPenjemputanService>(JadwalPenjemputanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
