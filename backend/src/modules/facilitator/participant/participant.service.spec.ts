import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { Participant, ParticipantStatus } from './participant.entity';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

describe('ParticipantService', () => {
  let service: ParticipantService;
  let repository: Repository<Participant>;

  const mockParticipant: Participant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    role: 'Incident Manager',
    lastActive: new Date('2023-01-01T10:00:00Z'),
    status: ParticipantStatus.ACTIVE,
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
        ParticipantService,
        {
          provide: getRepositoryToken(Participant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
    repository = module.get<Repository<Participant>>(getRepositoryToken(Participant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new participant', async () => {
      const createParticipantDto: CreateParticipantDto = {
        name: 'John Doe',
        role: 'Incident Manager',
        status: ParticipantStatus.ACTIVE,
      };

      mockRepository.create.mockReturnValue(mockParticipant);
      mockRepository.save.mockResolvedValue(mockParticipant);

      const result = await service.create(createParticipantDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createParticipantDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockParticipant);
      expect(result).toEqual(mockParticipant);
    });
  });

  describe('findAll', () => {
    it('should return an array of participants', async () => {
      const participants = [mockParticipant];
      mockRepository.find.mockResolvedValue(participants);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(participants);
    });
  });

  describe('findOne', () => {
    it('should return a participant by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockParticipant);

      const result = await service.findOne(mockParticipant.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockParticipant.id },
      });
      expect(result).toEqual(mockParticipant);
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a participant', async () => {
      const updateParticipantDto: UpdateParticipantDto = {
        name: 'Jane Doe',
        status: ParticipantStatus.INACTIVE,
      };

      const updatedParticipant = { ...mockParticipant, ...updateParticipantDto };

      mockRepository.findOne.mockResolvedValue(mockParticipant);
      mockRepository.save.mockResolvedValue(updatedParticipant);

      const result = await service.update(mockParticipant.id, updateParticipantDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockParticipant.id },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedParticipant);
      expect(result).toEqual(updatedParticipant);
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Jane Doe' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a participant', async () => {
      mockRepository.findOne.mockResolvedValue(mockParticipant);
      mockRepository.remove.mockResolvedValue(mockParticipant);

      await service.remove(mockParticipant.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockParticipant.id },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockParticipant);
    });

    it('should throw NotFoundException when participant not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
