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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ParticipantService } from './participant.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { Participant } from './participant.entity';

@ApiTags('participants')
@Controller('participants')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new participant' })
  @ApiResponse({
    status: 201,
    description: 'Participant created successfully',
    type: Participant,
  })
  create(
    @Body() createParticipantDto: CreateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.create(createParticipantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all participants' })
  @ApiResponse({
    status: 200,
    description: 'List of all participants',
    type: [Participant],
  })
  findAll(): Promise<Participant[]> {
    return this.participantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a participant by ID' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiResponse({
    status: 200,
    description: 'Participant found',
    type: Participant,
  })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  findOne(@Param('id') id: string): Promise<Participant> {
    return this.participantService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a participant' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiResponse({
    status: 200,
    description: 'Participant updated successfully',
    type: Participant,
  })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  update(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto,
  ): Promise<Participant> {
    return this.participantService.update(id, updateParticipantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a participant' })
  @ApiParam({ name: 'id', description: 'Participant ID' })
  @ApiResponse({ status: 204, description: 'Participant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.participantService.remove(id);
  }
}
