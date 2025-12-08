import { Test, TestingModule } from '@nestjs/testing';
import { XcardController } from './xcard.controller';
import { XcardService } from './xcard.service';

describe('XcardController', () => {
  let controller: XcardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XcardController],
      providers: [XcardService],
    }).compile();

    controller = module.get<XcardController>(XcardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
