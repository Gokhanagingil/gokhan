import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventType, EventStatus } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventController', () => {
  let controller: EventController;
  let service: EventService;

  const mockEvent: Event = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    type: EventType.INCIDENT,
    title: 'Server Outage',
    description: 'Production server is down',
    triggeredAt: new Date('2023-01-01T10:00:00Z'),
    status: EventStatus.OPEN,
    createdAt: new Date('2023-01-01T09:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  };

  const mockEventService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: EventService,
          useValue: mockEventService,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    service = module.get<EventService>(EventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        type: EventType.INCIDENT,
        title: 'Server Outage',
        description: 'Production server is down',
        status: EventStatus.OPEN,
      };

      mockEventService.create.mockResolvedValue(mockEvent);

      const result = await controller.create(createEventDto);

      expect(service.create).toHaveBeenCalledWith(createEventDto);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const events = [mockEvent];
      mockEventService.findAll.mockResolvedValue(events);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(events);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      mockEventService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne(mockEvent.id);

      expect(service.findOne).toHaveBeenCalledWith(mockEvent.id);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Server Outage',
        status: EventStatus.CLOSED,
      };

      const updatedEvent = { ...mockEvent, ...updateEventDto };
      mockEventService.update.mockResolvedValue(updatedEvent);

      const result = await controller.update(mockEvent.id, updateEventDto);

      expect(service.update).toHaveBeenCalledWith(mockEvent.id, updateEventDto);
      expect(result).toEqual(updatedEvent);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      mockEventService.remove.mockResolvedValue(undefined);

      await controller.remove(mockEvent.id);

      expect(service.remove).toHaveBeenCalledWith(mockEvent.id);
    });
  });
});
