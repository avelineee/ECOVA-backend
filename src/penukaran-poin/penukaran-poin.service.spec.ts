import { Test, TestingModule } from '@nestjs/testing';
import { PenukaranPoinService } from './penukaran-poin.service';

describe('PenukaranPoinService', () => {
  let service: PenukaranPoinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PenukaranPoinService],
    }).compile();

    service = module.get<PenukaranPoinService>(PenukaranPoinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});


