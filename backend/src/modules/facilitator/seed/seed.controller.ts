import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { seedDatabase } from '../../../seeds/seed';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@ApiTags('seed')
@Controller('seed')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SeedController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Post()
  @ApiOperation({ summary: 'Seed database with dummy data' })
  @ApiResponse({ status: 201, description: 'Database seeded successfully' })
  async seed(): Promise<{ message: string }> {
    await seedDatabase(this.dataSource);
    return { message: 'Seed completed' };
  }
}
