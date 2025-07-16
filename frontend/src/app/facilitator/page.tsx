'use client';

import { useState, useEffect } from 'react';

// Mock data types
interface Participant {
  id: string;
  name: string;
  role: string;
  lastActive: string;
  status: 'active' | 'inactive';
  score: number;
}

interface Event {
  id: string;
  type: 'incident' | 'request' | 'change' | 'agile-task' | 'problem';
  triggerTime: string;
  status: 'open' | 'closed';
  description: string;
}

// Mock data
const mockParticipants: Participant[] = [
  { id: '1', name: 'Alice Johnson', role: 'Service Manager', lastActive: '2 min ago', status: 'active', score: 85 },
  { id: '2', name: 'Bob Smith', role: 'Incident Manager', lastActive: '5 min ago', status: 'active', score: 92 },
  { id: '3', name: 'Carol Davis', role: 'Change Manager', lastActive: '1 min ago', status: 'active', score: 78 },
  { id: '4', name: 'David Wilson', role: 'Problem Manager', lastActive: '15 min ago', status: 'inactive', score: 65 },
  { id: '5', name: 'Eva Brown', role: 'Scrum Master', lastActive: '3 min ago', status: 'active', score: 88 },
];

const mockEvents: Event[] = [
  { id: '1', type: 'incident', triggerTime: '14:30', status: 'open', description: 'Server outage in production' },
  { id: '2', type: 'request', triggerTime: '14:15', status: 'closed', description: 'New user access request' },
  { id: '3', type: 'change', triggerTime: '14:00', status: 'open', description: 'Database migration scheduled' },
  { id: '4', type: 'problem', triggerTime: '13:45', status: 'open', description: 'Recurring network issues' },
];

export default function FacilitatorDashboard() {
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('all');

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
  const handleSendFeedback = () => {
    if (feedbackMessage.trim()) {
      // Mock feedback sending logic
      console.log(`Sending feedback to ${selectedParticipant}: ${feedbackMessage}`);
      setFeedbackMessage('');
      // In real implementation, this would call an API
    }
  };

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
                    {mockParticipants.map((participant) => (
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
                  disabled={!feedbackMessage.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Send Feedback
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
                {mockEvents.map((event) => (
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
                {mockParticipants.map((participant) => (
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
                {mockParticipants
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