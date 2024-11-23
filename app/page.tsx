'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface IMessage {
  id: string;
  name: string;
  message: string;
  date: string;
  sending: boolean;
}

const formatter = new Intl.DateTimeFormat('ru', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export default function Home() {
  const [userName, setUserName] = useState('Anonymous');
  const [localMessages, setLocalMessages] = useState<IMessage[]>([]);

  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WsServer;
    if (!wsUrl) {
      console.error('WebSocket URL не определён');
      return;
    }
    socket.current = new WebSocket(wsUrl);
    socket.current.onopen = () => console.log('Соединение установлено');
    socket.current.onmessage = (event) => {
      setLocalMessages(JSON.parse(event.data));
    };
    socket.current.onerror = (error) =>
      console.error('Ошибка WebSocket:', error);
    socket.current.onclose = () => console.log('Соединение закрыто');
    return () => {
      if (socket.current) socket.current.close();
    };
  }, []);

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (userName) {
      setUserName(userName);
    } else {
      const random = `Anonymous-${Math.floor(Math.random() * 100) + 1}`;
      const userName = prompt('Please, set your name', random);
      const currentName = userName ? userName : random;
      localStorage.setItem('userName', currentName);
      setUserName(currentName);
    }
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message');
    if (!message?.toString().trim()) {
      return;
    } else {
      const newMessage = {
        id: uuidv4(),
        name: userName,
        message: message + '',
        date: formatter.format(Date.now()),
        sending: true,
      };

      socket.current?.send(JSON.stringify({ ...newMessage, sending: false }));
      e.currentTarget.reset();
    }
  };

  return (
    <div className="min-h-screen flex justify-center py-5 bg-gradient-to-r  from-sky-500 to-indigo-500">
      <main className="max-w-6xl w-full flex flex-col gap-3">
        <div className="w-full max-h-[80%] min-h-[60%] overflow-scroll scrollbar-w-0 bg-[#f3f2f2] p-2 rounded-md flex flex-col gap-2">
          {localMessages.map((message) => {
            return (
              <div
                className={`flex gap-3 border border-solid border-black p-2 rounded-md shadow-md bg-white ${
                  message.sending ? 'animate-pulse' : ''
                }`}
                key={message.id}
              >
                <div>{message.date}</div>
                <div>{message.name}:</div>
                <div>{message.message}</div>
              </div>
            );
          })}
        </div>
        <div className="w-full">
          <form
            className="w-full flex justify-between gap-4"
            onSubmit={onSubmit}
          >
            <input
              type="text"
              className="w-full p-2 rounded-md outline-none hover:bg-[#fffafa]"
              name="message"
            />
            <button
              type="submit"
              className="bg-[#acffac] hover:bg-[#8ff78f] p-2 rounded-md"
            >
              Send
            </button>
            <button
              className="bg-[#acffac] hover:bg-[#8ff78f] p-2 rounded-md"
              onClick={(e) => {
                e.preventDefault();
                socket.current?.send(JSON.stringify('clearAll'));
              }}
            >
              Clear
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
