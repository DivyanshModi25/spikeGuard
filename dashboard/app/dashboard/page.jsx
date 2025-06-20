'use client'
import React, { useState } from 'react';

const servicesMock = [
  {
    id: 1,
    name: 'Image Recognition API',
    apiKey: 'sk-prod-9f13kfj32kl3',
    logs: ['Initialized service', 'User call at 10:21 AM', 'Error at 11:10 AM'],
  },
  {
    id: 2,
    name: 'Text Analyzer',
    apiKey: 'sk-prod-42kfj43ndf02',
    logs: ['Started session', 'User call at 9:45 AM'],
  },
];

export default function Dashboard() {
  const [services, setServices] = useState(servicesMock);
  const [newService, setNewService] = useState('');

  const handleCreateService = () => {
    if (!newService.trim()) return;
    const newEntry = {
      id: Date.now(),
      name: newService,
      apiKey: 'sk-prod-' + Math.random().toString(36).substring(2, 16),
      logs: ['Service created'],
    };
    setServices([newEntry, ...services]);
    setNewService('');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Replace this with your navigation logic (e.g., react-router)
  const goToAnalysis = (service) => {
    console.log('Navigate to analysis page for:', service);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="text-3xl font-bold text-orange-500 mb-10">Developer Dashboard</header>

      {/* Create Service Section */}
      <div className="bg-[#2b2b2b] border border-[#3a3a3a] p-8 rounded-2xl mb-16 shadow-md">
        <h2 className="text-2xl font-semibold mb-3 text-white">Create New Service</h2>
        <p className="text-sm text-gray-400 mb-5">Generate a service and get its unique API key</p>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            type="text"
            placeholder="Service name..."
            className="flex-1 px-4 py-2 bg-[#1e1e1e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
          />
          <button
            onClick={handleCreateService}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg font-medium"
          >
            Create Service
          </button>
        </div>
      </div>

      {/* Services Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">Your Services</h2>
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-[#1e1e1e] p-6 rounded-xl flex justify-between items-start shadow-md border border-[#2a2a2a]"
          >
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{service.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">API Key:</span>
                <span className="text-orange-400 font-mono text-sm">{service.apiKey}</span>
                <button
                  onClick={() => handleCopy(service.apiKey)}
                  className="text-xs text-orange-500 hover:underline ml-2"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <button
                onClick={() => goToAnalysis(service)}
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                View Analysis
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 