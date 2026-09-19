import { Test, TestingModule } from '@nestjs/testing';
import { HadiahService } from './hadiah.service';

describe('HadiahService', () => {
  let service: HadiahService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HadiahService],
    }).compile();

    service = module.get<HadiahService>(HadiahService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
