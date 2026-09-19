import { Test, TestingModule } from '@nestjs/testing';
import { RekapitulasiService } from './rekapitulasi.service';

describe('RekapitulasiService', () => {
  let service: RekapitulasiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RekapitulasiService],
    }).compile();

    service = module.get<RekapitulasiService>(RekapitulasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
