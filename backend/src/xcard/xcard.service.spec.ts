import { Test, TestingModule } from '@nestjs/testing';
import { XcardService } from './xcard.service';

describe('XcardService', () => {
  let service: XcardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XcardService],
    }).compile();

    service = module.get<XcardService>(XcardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
