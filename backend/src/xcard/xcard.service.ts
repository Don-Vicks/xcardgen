import { Injectable } from '@nestjs/common';
import { CreateXcardDto } from './dto/create-xcard.dto';
import { UpdateXcardDto } from './dto/update-xcard.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class XcardService {
  constructor(private prisma: PrismaService) {}
  async create(createXcardDto: CreateXcardDto) {
    return 'This action adds a new xcard';
  }

  findAll() {
    return `This action returns all xcard`;
  }

  findOne(id: number) {
    return `This action returns a #${id} xcard`;
  }

  update(id: number, updateXcardDto: UpdateXcardDto) {
    return `This action updates a #${id} xcard`;
  }

  remove(id: number) {
    return `This action removes a #${id} xcard`;
  }
}
