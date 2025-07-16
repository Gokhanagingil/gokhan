'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ApiParticipant {
  id: string;
  name: string;
  role: string;
  score: number;
  feedback: string[];
  lastEventTime: string;
}

interface ApiEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ApiScore {
  id: string;
  participantId: string;
  value: number;
  timestamp: string;
}

interface ApiFeedback {
  id: string;
  participantId: string;
  message: string;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:3001/api';
const socket: Socket = io('http://localhost:3001');

const formatRelativeTime = (dateString: string): string => {
  const diff = Date.now() - new Date(dateString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} saniye önce`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  return `${hours} saat önce`;
};

const autoLogin = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin' }),
  });

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data.access_token;
};

const fetchParticipants = async (): Promise<ApiParticipant[]> => {
  let token = localStorage.getItem('token');
  if (!token) token = await autoLogin();

  const response = await fetch(`${API_BASE_URL}/participants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
};

const fetchEvents = async (): Promise<ApiEvent[]> => {
  let token = localStorage.getItem('token');
  if (!token) token = await autoLogin();

  const response = await fetch(`${API_BASE_URL}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
};

const fetchScores = async (): Promise<ApiScore[]> => {
  let token = localStorage.getItem('token');
  if (!token) token = await autoLogin();

  const response = await fetch(`${API_BASE_URL}/scores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await response.json();
};

const sendFeedback = async (participantId: string, message: string): Promise<ApiFeedback> => {
  let token = localStorage.getItem('token');
  if (!token) token = await autoLogin();

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ participantId, message }),
  });
  return await response.json();
};

export default function FacilitatorPage() {
  const [participants, setParticipants] = useState<ApiParticipant[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [scores, setScores] = useState<ApiScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [p, e, s] = await Promise.all([
          fetchParticipants(),
          fetchEvents(),
          fetchScores(),
        ]);
        setParticipants(p);
        setEvents(e);
        setScores(s);
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    socket.on('eventUpdate', (event: ApiEvent) => {
      setEvents((prev) => [...prev, event]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Facilitator Paneli</h1>

      <h2 className="text-xl font-semibold mt-6">Katılımcılar</h2>
      <ul className="list-disc pl-5">
        {participants.map((p) => (
          <li key={p.id}>
            {p.name} ({p.role}) – Skor: {p.score}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Olaylar</h2>
      <ul className="list-disc pl-5">
        {events.map((e) => (
          <li key={e.id}>
            [{formatRelativeTime(e.timestamp)}] {e.type}: {e.description}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6">Skorlar</h2>
      <ul className="list-disc pl-5">
        {scores.map((s) => (
          <li key={s.id}>
            Katılımcı: {s.participantId}, Değer: {s.value}, Zaman: {formatRelativeTime(s.timestamp)}
          </li>
        ))}
      </ul>
    </div>
  );
}
