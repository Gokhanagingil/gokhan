import { DataSource } from 'typeorm';
import { Participant, ParticipantStatus } from '../modules/facilitator/participant/participant.entity';
import { Event, EventType, EventStatus } from '../modules/facilitator/event/event.entity';
import { Feedback } from '../modules/facilitator/feedback/feedback.entity';
import { Score } from '../modules/facilitator/score/score.entity';

export async function seedDatabase(dataSource: DataSource) {
  const participantRepository = dataSource.getRepository(Participant);
  const eventRepository = dataSource.getRepository(Event);
  const feedbackRepository = dataSource.getRepository(Feedback);
  const scoreRepository = dataSource.getRepository(Score);

  const participants = await participantRepository.save([
    {
      name: 'Alice Johnson',
      role: 'Incident Manager',
      status: ParticipantStatus.ACTIVE,
      lastActive: new Date(),
    },
    {
      name: 'Bob Smith',
      role: 'Change Authority',
      status: ParticipantStatus.ACTIVE,
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      name: 'Charlie Brown',
      role: 'Agile Lead',
      status: ParticipantStatus.INACTIVE,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ]);

  console.log('✅ Created 3 participants');

  const events = await eventRepository.save([
    {
      type: EventType.INCIDENT,
      title: 'Production Server Outage',
      description: 'Main production server is experiencing downtime affecting all users',
      triggeredAt: new Date(),
      status: EventStatus.OPEN,
    },
    {
      type: EventType.CHANGE,
      title: 'Database Migration Scheduled',
      description: 'Scheduled maintenance window for database schema updates',
      triggeredAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      status: EventStatus.CLOSED,
    },
  ]);

  console.log('✅ Created 2 events');

  const feedback = await feedbackRepository.save({
    participantId: participants[0].id,
    message: 'Excellent response time on the incident! Keep up the great work.',
    sentAt: new Date(),
  });

  console.log('✅ Created 1 feedback');

  const scores = await scoreRepository.save([
    {
      participantId: participants[0].id,
      value: 95.5,
      reason: 'Outstanding incident response and communication',
      timestamp: new Date(),
    },
    {
      participantId: participants[1].id,
      value: 87.0,
      reason: 'Good change management process execution',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
  ]);

  console.log('✅ Created 2 score entries');

  console.log('🌱 Database seeding completed successfully!');
  console.log(`📊 Summary:
  - Participants: ${participants.length}
  - Events: ${events.length}
  - Feedback: 1
  - Scores: ${scores.length}`);

  return {
    participants,
    events,
    feedback,
    scores,
  };
}

export async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'arctic_echo',
    entities: [Participant, Event, Feedback, Score],
    synchronize: false, // Don't auto-sync in production
  });

  try {
    await dataSource.initialize();
    console.log('📡 Database connection established');
    
    await seedDatabase(dataSource);
    
    await dataSource.destroy();
    console.log('📡 Database connection closed');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed();
}
