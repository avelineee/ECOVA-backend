import { Test, TestingModule } from '@nestjs/testing';
import { SetorSampahService } from './setor-sampah.service';

describe('SetorSampahService', () => {
  let service: SetorSampahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetorSampahService],
    }).compile();

    service = module.get<SetorSampahService>(SetorSampahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
