import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantController } from './participant.controller';
import { ParticipantService } from './participant.service';
import { Participant, ParticipantStatus } from './participant.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

describe('ParticipantController', () => {
  let controller: ParticipantController;
  let service: ParticipantService;

  const mockParticipant: Participant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    role: 'Incident Manager',
    lastActive: new Date('2023-01-01T10:00:00Z'),
    status: ParticipantStatus.ACTIVE,
    createdAt: new Date('2023-01-01T09:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  };

  const mockParticipantService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [
        {
          provide: ParticipantService,
          useValue: mockParticipantService,
        },
      ],
    }).compile();

    controller = module.get<ParticipantController>(ParticipantController);
    service = module.get<ParticipantService>(ParticipantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new participant', async () => {
      const createParticipantDto: CreateParticipantDto = {
        name: 'John Doe',
        role: 'Incident Manager',
        status: ParticipantStatus.ACTIVE,
      };

      mockParticipantService.create.mockResolvedValue(mockParticipant);

      const result = await controller.create(createParticipantDto);

      expect(service.create).toHaveBeenCalledWith(createParticipantDto);
      expect(result).toEqual(mockParticipant);
    });
  });

  describe('findAll', () => {
    it('should return an array of participants', async () => {
      const participants = [mockParticipant];
      mockParticipantService.findAll.mockResolvedValue(participants);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(participants);
    });
  });

  describe('findOne', () => {
    it('should return a participant by id', async () => {
      mockParticipantService.findOne.mockResolvedValue(mockParticipant);

      const result = await controller.findOne(mockParticipant.id);

      expect(service.findOne).toHaveBeenCalledWith(mockParticipant.id);
      expect(result).toEqual(mockParticipant);
    });
  });

  describe('update', () => {
    it('should update a participant', async () => {
      const updateParticipantDto: UpdateParticipantDto = {
        name: 'Jane Doe',
        status: ParticipantStatus.INACTIVE,
      };

      const updatedParticipant = { ...mockParticipant, ...updateParticipantDto };
      mockParticipantService.update.mockResolvedValue(updatedParticipant);

      const result = await controller.update(mockParticipant.id, updateParticipantDto);

      expect(service.update).toHaveBeenCalledWith(mockParticipant.id, updateParticipantDto);
      expect(result).toEqual(updatedParticipant);
    });
  });

  describe('remove', () => {
    it('should remove a participant', async () => {
      mockParticipantService.remove.mockResolvedValue(undefined);

      await controller.remove(mockParticipant.id);

      expect(service.remove).toHaveBeenCalledWith(mockParticipant.id);
    });
  });
});
