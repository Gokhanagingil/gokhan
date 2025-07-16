import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let repository: Repository<Feedback>;

  const mockFeedback: Feedback = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    participantId: '123e4567-e89b-12d3-a456-426614174000',
    message: 'Great job handling the incident!',
    sentAt: new Date('2023-01-01T10:00:00Z'),
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
        FeedbackService,
        {
          provide: getRepositoryToken(Feedback),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    repository = module.get<Repository<Feedback>>(getRepositoryToken(Feedback));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new feedback', async () => {
      const createFeedbackDto: CreateFeedbackDto = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Great job handling the incident!',
      };

      mockRepository.create.mockReturnValue(mockFeedback);
      mockRepository.save.mockResolvedValue(mockFeedback);

      const result = await service.create(createFeedbackDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createFeedbackDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockFeedback);
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('findAll', () => {
    it('should return an array of feedback', async () => {
      const feedbacks = [mockFeedback];
      mockRepository.find.mockResolvedValue(feedbacks);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['participant'],
      });
      expect(result).toEqual(feedbacks);
    });
  });

  describe('findOne', () => {
    it('should return feedback by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeedback);

      const result = await service.findOne(mockFeedback.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockFeedback.id },
        relations: ['participant'],
      });
      expect(result).toEqual(mockFeedback);
    });

    it('should throw NotFoundException when feedback not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByParticipant', () => {
    it('should return feedback for a specific participant', async () => {
      const feedbacks = [mockFeedback];
      mockRepository.find.mockResolvedValue(feedbacks);

      const result = await service.findByParticipant(mockFeedback.participantId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { participantId: mockFeedback.participantId },
        relations: ['participant'],
      });
      expect(result).toEqual(feedbacks);
    });
  });

  describe('update', () => {
    it('should update feedback', async () => {
      const updateFeedbackDto: UpdateFeedbackDto = {
        message: 'Updated feedback message',
      };

      const updatedFeedback = { ...mockFeedback, ...updateFeedbackDto };

      mockRepository.findOne.mockResolvedValue(mockFeedback);
      mockRepository.save.mockResolvedValue(updatedFeedback);

      const result = await service.update(mockFeedback.id, updateFeedbackDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockFeedback.id },
        relations: ['participant'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedFeedback);
      expect(result).toEqual(updatedFeedback);
    });

    it('should throw NotFoundException when feedback not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { message: 'Updated message' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove feedback', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeedback);
      mockRepository.remove.mockResolvedValue(mockFeedback);

      await service.remove(mockFeedback.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockFeedback.id },
        relations: ['participant'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockFeedback);
    });

    it('should throw NotFoundException when feedback not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
