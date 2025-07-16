import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: FeedbackService;

  const mockFeedback: Feedback = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    participantId: '123e4567-e89b-12d3-a456-426614174000',
    message: 'Great job handling the incident!',
    sentAt: new Date('2023-01-01T10:00:00Z'),
    participant: undefined as any,
    createdAt: new Date('2023-01-01T09:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  };

  const mockFeedbackService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByParticipant: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create new feedback', async () => {
      const createFeedbackDto: CreateFeedbackDto = {
        participantId: '123e4567-e89b-12d3-a456-426614174000',
        message: 'Great job handling the incident!',
      };

      mockFeedbackService.create.mockResolvedValue(mockFeedback);

      const result = await controller.create(createFeedbackDto);

      expect(service.create).toHaveBeenCalledWith(createFeedbackDto);
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('findAll', () => {
    it('should return an array of feedback', async () => {
      const feedbacks = [mockFeedback];
      mockFeedbackService.findAll.mockResolvedValue(feedbacks);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(feedbacks);
    });
  });

  describe('findOne', () => {
    it('should return feedback by id', async () => {
      mockFeedbackService.findOne.mockResolvedValue(mockFeedback);

      const result = await controller.findOne(mockFeedback.id);

      expect(service.findOne).toHaveBeenCalledWith(mockFeedback.id);
      expect(result).toEqual(mockFeedback);
    });
  });

  describe('findAll with participantId query', () => {
    it('should return feedback for a specific participant when participantId is provided', async () => {
      const feedbacks = [mockFeedback];
      mockFeedbackService.findByParticipant.mockResolvedValue(feedbacks);

      const result = await controller.findAll(mockFeedback.participantId);

      expect(service.findByParticipant).toHaveBeenCalledWith(mockFeedback.participantId);
      expect(result).toEqual(feedbacks);
    });
  });

  describe('update', () => {
    it('should update feedback', async () => {
      const updateFeedbackDto: UpdateFeedbackDto = {
        message: 'Updated feedback message',
      };

      const updatedFeedback = { ...mockFeedback, ...updateFeedbackDto };
      mockFeedbackService.update.mockResolvedValue(updatedFeedback);

      const result = await controller.update(mockFeedback.id, updateFeedbackDto);

      expect(service.update).toHaveBeenCalledWith(mockFeedback.id, updateFeedbackDto);
      expect(result).toEqual(updatedFeedback);
    });
  });

  describe('remove', () => {
    it('should remove feedback', async () => {
      mockFeedbackService.remove.mockResolvedValue(undefined);

      await controller.remove(mockFeedback.id);

      expect(service.remove).toHaveBeenCalledWith(mockFeedback.id);
    });
  });
});
