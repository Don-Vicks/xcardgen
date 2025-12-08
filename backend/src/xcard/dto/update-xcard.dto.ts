import { PartialType } from '@nestjs/mapped-types';
import { CreateXcardDto } from './create-xcard.dto';

export class UpdateXcardDto extends PartialType(CreateXcardDto) {
  id: number;
}
