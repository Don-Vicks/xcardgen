import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { XcardService } from './xcard.service';
import { CreateXcardDto } from './dto/create-xcard.dto';
import { UpdateXcardDto } from './dto/update-xcard.dto';

@Controller()
export class XcardController {
  constructor(private readonly xcardService: XcardService) {}

  @MessagePattern('createXcard')
  create(@Payload() createXcardDto: CreateXcardDto) {
    return this.xcardService.create(createXcardDto);
  }

  @MessagePattern('findAllXcard')
  findAll() {
    return this.xcardService.findAll();
  }

  @MessagePattern('findOneXcard')
  findOne(@Payload() id: number) {
    return this.xcardService.findOne(id);
  }

  @MessagePattern('updateXcard')
  update(@Payload() updateXcardDto: UpdateXcardDto) {
    return this.xcardService.update(updateXcardDto.id, updateXcardDto);
  }

  @MessagePattern('removeXcard')
  remove(@Payload() id: number) {
    return this.xcardService.remove(id);
  }
}
