'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface ApiParticipant {
  id: string;
  name: string;
  role: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'ai-controlled';
  createdAt: string;
  updatedAt: string;
}

interface ApiEvent {
  id: string;
  type: 'incident' | 'request' | 'change' | 'agile-task' | 'problem';
  title: string;
  description: string;
  triggeredAt: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface ApiScore {
  id: string;
  participantId: string;
  value: number;
  reason: string;
  timestamp: string;
  participant?: ApiParticipant;
}

interface ApiFeedback {
  id: string;
  participantId: string;
  message: string;
  sentAt: string;
}

interface Participant extends Omit<ApiParticipant, 'lastActive'> {
  lastActive: string;
  score: number;
}

interface Event extends Omit<ApiEvent, 'triggeredAt'> {
  triggerTime: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

const socket: Socket = io('http://localhost:3001');

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const formatTriggerTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};


const autoLogin = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@arctic-echo.com',
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123',
    }),
  });
  if (!response.ok) throw new Error('Auto-login failed');
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data.token;
};

const fetchParticipants = async (): Promise<ApiParticipant[]> => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = await autoLogin();
  }
  
  const response = await fetch(`${API_BASE_URL}/participants`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch participants');
  return response.json();
};

const fetchEvents = async (): Promise<ApiEvent[]> => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = await autoLogin();
  }
  
  const response = await fetch(`${API_BASE_URL}/events`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
};

const fetchScores = async (): Promise<ApiScore[]> => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = await autoLogin();
  }
  
  const response = await fetch(`${API_BASE_URL}/scores`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch scores');
  return response.json();
};

const sendFeedback = async (participantId: string, message: string): Promise<ApiFeedback> => {
  let token = localStorage.getItem('token');
  if (!token) {
    token = await autoLogin();
  }
  
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      participantId,
      message,
    }),
  });
  if (!response.ok) throw new Error('Failed to send feedback');
  return response.json();
};

export default function FacilitatorDashboard() {
  const [timeRemaining, setTimeRemaining] = useState(3600);
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('all');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [participantsData, eventsData, scoresData] = await Promise.all([
        fetchParticipants(),
        fetchEvents(),
        fetchScores(),
      ]);
        
        const scoresByParticipant = scoresData.reduce((acc, score) => {
          if (!acc[score.participantId]) {
            acc[score.participantId] = [];
          }
          acc[score.participantId].push(score.value);
          return acc;
        }, {} as Record<string, number[]>);
        
        const transformedParticipants: Participant[] = participantsData.map(p => ({
          ...p,
          lastActive: formatRelativeTime(p.lastActive),
          score: scoresByParticipant[p.id] 
            ? Math.round(scoresByParticipant[p.id].reduce((sum, score) => sum + score, 0) / scoresByParticipant[p.id].length)
            : 0,
        }));
        
        const transformedEvents: Event[] = eventsData.map(e => ({
          ...e,
          triggerTime: formatTriggerTime(e.triggeredAt),
        }));
        
      setParticipants(transformedParticipants);
      setEvents(transformedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        try {
          await autoLogin();
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
    };
    
    initializeAuth().then(() => fetchData());
  }, []);

  useEffect(() => {
    socket.on('new-participant', (participant) => {
      setParticipants(prev => [...prev, participant]);
      console.log('New participant added:', participant);
    });

    socket.on('new-event', (event) => {
      setEvents(prev => [...prev, event]);
      console.log('New event triggered:', event);
    });

    socket.on('score-updated', (score) => {
      console.log('Score updated:', score);
      fetchData();
    });

    socket.on('session-update', (session) => {
      console.log('Session updated:', session);
    });

    return () => {
      socket.off('new-participant');
      socket.off('new-event');
      socket.off('score-updated');
      socket.off('session-update');
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get event type styling
  const getEventTypeStyle = (type: Event['type']) => {
    const styles = {
      incident: 'bg-red-100 text-red-800 border-red-200',
      request: 'bg-blue-100 text-blue-800 border-blue-200',
      change: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      problem: 'bg-purple-100 text-purple-800 border-purple-200',
      'agile-task': 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[type];
  };

  // Get status styling
  const getStatusStyle = (status: string) => {
    return status === 'active' || status === 'open'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  // Handle feedback submission
  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim() || selectedParticipant === 'all') {
      return;
    }
    
    try {
      setSendingFeedback(true);
      await sendFeedback(selectedParticipant, feedbackMessage);
      setFeedbackMessage('');
      console.log('Feedback sent successfully');
    } catch (err) {
      console.error('Error sending feedback:', err);
      alert('Failed to send feedback. Please try again.');
    } finally {
      setSendingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Arctic Echo - Facilitator Dashboard</h1>
            <p className="text-gray-600">ITIL 4 & Agile Training Simulation Control Panel</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Arctic Echo - Facilitator Dashboard</h1>
            <p className="text-gray-600">ITIL 4 & Agile Training Simulation Control Panel</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Arctic Echo - Facilitator Dashboard</h1>
          <p className="text-gray-600">ITIL 4 & Agile Training Simulation Control Panel</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Session Timer Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Session Timer
              </h2>
              <div className="text-center">
                <div className={`text-6xl font-mono font-bold mb-4 ${timeRemaining < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Start
                  </button>
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Pause
                  </button>
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Stop
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Feedback Panel
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send to:</label>
                  <select 
                    value={selectedParticipant}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Participants</option>
                    {participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message:</label>
                  <textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Type your feedback message here..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <button
                  onClick={handleSendFeedback}
                  disabled={!feedbackMessage.trim() || selectedParticipant === 'all' || sendingFeedback}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {sendingFeedback ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Triggered Events Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h5v-5H4v5zM13 7h5l-5-5v5zM4 1h5v5H4V1z" />
                </svg>
                Triggered Events
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventTypeStyle(event.type)}`}>
                        {event.type.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">{event.description}</p>
                    <p className="text-xs text-gray-500">Triggered at: {event.triggerTime}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  Trigger New Event
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Participant Monitor Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Participant Monitor
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-800">{participant.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(participant.status)}`}>
                        {participant.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{participant.role}</p>
                    <p className="text-xs text-gray-500">Last active: {participant.lastActive}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoreboard Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Scoreboard
              </h2>
              <div className="space-y-3">
                {participants
                  .sort((a, b) => b.score - a.score)
                  .map((participant, index) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{participant.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${participant.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-8 text-right">{participant.score}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
