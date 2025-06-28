import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { interfaceService } from '../services/interfaceService';
import { Cpu, Copy, User, CalendarDays, Info } from 'lucide-react';

export default function InterfaceListPage() {
  const navigate = useNavigate();
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterfaces = async () => {
      try {
        const data = await interfaceService.getInterfaces();
        console.log(data);
        setInterfaces(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load interfaces');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterfaces();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Interfaces</h1>
          <button
            onClick={() => navigate('/interface/setup')}
            className="btn-primary"
          >
            Add Interface
          </button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-error-600 dark:text-error-300">{error}</div>
        ) : interfaces.length === 0 ? (
          <div className="text-gray-500">No interfaces found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interfaces.map((intf) => (
              <div key={intf.id} className="card p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="text-primary-500 w-5 h-5" />
                  <h2 className="text-lg font-semibold">{intf.name}</h2>
                </div>

                {intf.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <Info className="w-4 h-4" /> {intf.description}
                  </div>
                )}

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <span className="font-medium">ID:</span>
                  <span className="truncate">{intf.id}</span>
                  <button
                    onClick={() => handleCopy(intf.id)}
                    title="Copy Interface ID"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copiedId === intf.id && (
                    <span className="text-green-500 text-xs ml-1">Copied!</span>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {intf.ownerUsername} — <span className="italic">{intf.role}</span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Created on {new Date(intf.createdAt).toLocaleDateString()}
                </div>

                <div>
                  <button
                    onClick={() => navigate(`/interface/${intf.id}`)}
                    className="btn-outline text-sm mt-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
