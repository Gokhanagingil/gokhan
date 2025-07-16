import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './score.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
  ) {}

  async create(createScoreDto: CreateScoreDto): Promise<Score> {
    const score = this.scoreRepository.create(createScoreDto);
    return this.scoreRepository.save(score);
  }

  async findAll(): Promise<Score[]> {
    return this.scoreRepository.find({
      relations: ['participant'],
    });
  }

  async findOne(id: string): Promise<Score> {
    const score = await this.scoreRepository.findOne({
      where: { id },
      relations: ['participant'],
    });
    if (!score) {
      throw new NotFoundException(`Score with ID ${id} not found`);
    }
    return score;
  }

  async findByParticipant(participantId: string): Promise<Score[]> {
    return this.scoreRepository.find({
      where: { participantId },
      relations: ['participant'],
    });
  }

  async update(id: string, updateScoreDto: UpdateScoreDto): Promise<Score> {
    const score = await this.findOne(id);
    Object.assign(score, updateScoreDto);
    return this.scoreRepository.save(score);
  }

  async remove(id: string): Promise<void> {
    const score = await this.findOne(id);
    await this.scoreRepository.remove(score);
  }
}
