import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ScoreService } from './score.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { Score } from './score.entity';

@ApiTags('scores')
@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new score' })
  @ApiResponse({
    status: 201,
    description: 'Score created successfully',
    type: Score,
  })
  create(@Body() createScoreDto: CreateScoreDto): Promise<Score> {
    return this.scoreService.create(createScoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all scores' })
  @ApiQuery({
    name: 'participantId',
    required: false,
    description: 'Filter by participant ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all scores',
    type: [Score],
  })
  findAll(@Query('participantId') participantId?: string): Promise<Score[]> {
    if (participantId) {
      return this.scoreService.findByParticipant(participantId);
    }
    return this.scoreService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a score by ID' })
  @ApiParam({ name: 'id', description: 'Score ID' })
  @ApiResponse({ status: 200, description: 'Score found', type: Score })
  @ApiResponse({ status: 404, description: 'Score not found' })
  findOne(@Param('id') id: string): Promise<Score> {
    return this.scoreService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a score' })
  @ApiParam({ name: 'id', description: 'Score ID' })
  @ApiResponse({
    status: 200,
    description: 'Score updated successfully',
    type: Score,
  })
  @ApiResponse({ status: 404, description: 'Score not found' })
  update(
    @Param('id') id: string,
    @Body() updateScoreDto: UpdateScoreDto,
  ): Promise<Score> {
    return this.scoreService.update(id, updateScoreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a score' })
  @ApiParam({ name: 'id', description: 'Score ID' })
  @ApiResponse({ status: 204, description: 'Score deleted successfully' })
  @ApiResponse({ status: 404, description: 'Score not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.scoreService.remove(id);
  }
}
