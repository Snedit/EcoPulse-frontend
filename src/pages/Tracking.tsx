// src/pages/Tracking.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { interfaceService } from '../services/interfaceService';
import PageLayout from '../components/layout/PageLayout';

export default function Tracking() {
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    interfaceService.getInterfaces().then(setInterfaces);
  }, []);

  return (
    <PageLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Tracking Interface Devices</h1>
        <div className="space-y-3">
          {interfaces.map((intf) => (
            <div key={intf.id} className="card p-4 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{intf.name}</h2>
                <p className="text-sm text-gray-500">{intf.description}</p>
              </div>
              <button
                onClick={() => navigate(`/trace/${intf.id}`)}
                className="btn-primary"
              >
                Track Route
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
