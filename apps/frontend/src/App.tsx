import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Fullstack Demo</h1>
          <p className="text-slate-600 mt-2">
            A modern fullstack application with React, Hono.js, and PostgreSQL
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button onClick={fetchUsers} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh Users'}
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 text-red-800 mb-4">
                <p>{error}</p>
              </div>
            )}

            {users.length === 0 && !loading && !error && (
              <p className="text-slate-500">No users found. Add some users to the database.</p>
            )}

            {users.length > 0 && (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Created: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
