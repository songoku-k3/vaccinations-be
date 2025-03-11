import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MomoService {
  constructor(private readonly prismaService: PrismaService) {}
}
