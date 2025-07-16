import { Test, TestingModule } from '@nestjs/testing';
import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { Score } from './score.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

describe('ScoreController', () => {
  let controller: ScoreController;
  let service: ScoreService;

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

  const mockScoreService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByParticipant: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScoreController],
      providers: [
        {
          provide: ScoreService,
          useValue: mockScoreService,
        },
      ],
    }).compile();

    controller = module.get<ScoreController>(ScoreController);
    service = module.get<ScoreService>(ScoreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new score', async () => {
      const createScoreDto: CreateScoreDto = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        value: 85.5,
        reason: 'Excellent incident response time',
      };

      mockScoreService.create.mockResolvedValue(mockScore);

      const result = await controller.create(createScoreDto);

      expect(service.create).toHaveBeenCalledWith(createScoreDto);
      expect(result).toEqual(mockScore);
    });
  });

  describe('findAll', () => {
    it('should return an array of scores', async () => {
      const scores = [mockScore];
      mockScoreService.findAll.mockResolvedValue(scores);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(scores);
    });
  });

  describe('findOne', () => {
    it('should return a score by id', async () => {
      mockScoreService.findOne.mockResolvedValue(mockScore);

      const result = await controller.findOne(mockScore.id);

      expect(service.findOne).toHaveBeenCalledWith(mockScore.id);
      expect(result).toEqual(mockScore);
    });
  });

  describe('findAll with participantId query', () => {
    it('should return scores for a specific participant when participantId is provided', async () => {
      const scores = [mockScore];
      mockScoreService.findByParticipant.mockResolvedValue(scores);

      const result = await controller.findAll(mockScore.participantId);

      expect(service.findByParticipant).toHaveBeenCalledWith(mockScore.participantId);
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
      mockScoreService.update.mockResolvedValue(updatedScore);

      const result = await controller.update(mockScore.id, updateScoreDto);

      expect(service.update).toHaveBeenCalledWith(mockScore.id, updateScoreDto);
      expect(result).toEqual(updatedScore);
    });
  });

  describe('remove', () => {
    it('should remove a score', async () => {
      mockScoreService.remove.mockResolvedValue(undefined);

      await controller.remove(mockScore.id);

      expect(service.remove).toHaveBeenCalledWith(mockScore.id);
    });
  });
});
