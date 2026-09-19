import { Test, TestingModule } from '@nestjs/testing';
import { KategoriSampahService } from './kategori-sampah.service';

describe('KategoriSampahService', () => {
  let service: KategoriSampahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KategoriSampahService],
    }).compile();

    service = module.get<KategoriSampahService>(KategoriSampahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
