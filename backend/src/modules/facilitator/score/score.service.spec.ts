import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ScoreService } from './score.service';
import { Score } from './score.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

describe('ScoreService', () => {
  let service: ScoreService;
  let repository: Repository<Score>;

  const mockScore: Score = {
    id: '123e4567-e89b-12d3-a456-426614174003',
    participantId: '123e4567-e89b-12d3-a456-426614174000',
    value: 85.5,
    reason: 'Excellent incident response time',
    timestamp: new Date('2023-01-01T10:00:00Z'),
    participant: undefined as any,
    createdAt: new Date('2023-01-01T09:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: getRepositoryToken(Score),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
    repository = module.get<Repository<Score>>(getRepositoryToken(Score));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new score', async () => {
      const createScoreDto: CreateScoreDto = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        value: 85.5,
        reason: 'Excellent incident response time',
      };

      mockRepository.create.mockReturnValue(mockScore);
      mockRepository.save.mockResolvedValue(mockScore);

      const result = await service.create(createScoreDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createScoreDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockScore);
      expect(result).toEqual(mockScore);
    });
  });

  describe('findAll', () => {
    it('should return an array of scores', async () => {
      const scores = [mockScore];
      mockRepository.find.mockResolvedValue(scores);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['participant'],
      });
      expect(result).toEqual(scores);
    });
  });

  describe('findOne', () => {
    it('should return a score by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockScore);

      const result = await service.findOne(mockScore.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockScore.id },
        relations: ['participant'],
      });
      expect(result).toEqual(mockScore);
    });

    it('should throw NotFoundException when score not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByParticipant', () => {
    it('should return scores for a specific participant', async () => {
      const scores = [mockScore];
      mockRepository.find.mockResolvedValue(scores);

      const result = await service.findByParticipant(mockScore.participantId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { participantId: mockScore.participantId },
        relations: ['participant'],
      });
      expect(result).toEqual(scores);
    });
  });

  describe('update', () => {
    it('should update a score', async () => {
      const updateScoreDto: UpdateScoreDto = {
        value: 90.0,
        reason: 'Updated score for better performance',
      };

      const updatedScore = { ...mockScore, ...updateScoreDto };

      mockRepository.findOne.mockResolvedValue(mockScore);
      mockRepository.save.mockResolvedValue(updatedScore);

      const result = await service.update(mockScore.id, updateScoreDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockScore.id },
        relations: ['participant'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedScore);
      expect(result).toEqual(updatedScore);
    });

    it('should throw NotFoundException when score not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { value: 90.0 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a score', async () => {
      mockRepository.findOne.mockResolvedValue(mockScore);
      mockRepository.remove.mockResolvedValue(mockScore);

      await service.remove(mockScore.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockScore.id },
        relations: ['participant'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockScore);
    });

    it('should throw NotFoundException when score not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
