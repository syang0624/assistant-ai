import { useState, useEffect } from 'react';
import { locationAPI } from '../services/api';
import type { Location } from '../types';

const LocationForm: React.FC = () => {
  const [locations, setLocations] = useState<Location>({ constituencies: {} });
  const [newConstituency, setNewConstituency] = useState('');
  const [newWard, setNewWard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await locationAPI.get();
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await locationAPI.set(locations);
      setSuccess('Locations updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update locations');
    } finally {
      setLoading(false);
    }
  };

  const addConstituency = () => {
    if (newConstituency.trim()) {
      setLocations(prev => ({
        constituencies: {
          ...prev.constituencies,
          [newConstituency.trim()]: []
        }
      }));
      setNewConstituency('');
    }
  };

  const addWard = (constituency: string) => {
    if (newWard.trim()) {
      setLocations(prev => ({
        constituencies: {
          ...prev.constituencies,
          [constituency]: [...(prev.constituencies[constituency] || []), newWard.trim()]
        }
      }));
      setNewWard('');
    }
  };

  const removeConstituency = (constituency: string) => {
    const newLocations = { ...locations };
    delete newLocations.constituencies[constituency];
    setLocations(newLocations);
  };

  const removeWard = (constituency: string, ward: string) => {
    setLocations(prev => ({
      constituencies: {
        ...prev.constituencies,
        [constituency]: prev.constituencies[constituency].filter(w => w !== ward)
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Locations</h1>
        <p className="text-gray-600">Set your preferred constituencies and wards</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Constituency</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newConstituency}
              onChange={(e) => setNewConstituency(e.target.value)}
              placeholder="Enter constituency name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addConstituency}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Constituencies & Wards</h2>
          {Object.keys(locations.constituencies).length === 0 ? (
            <p className="text-gray-500">No constituencies added yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(locations.constituencies).map(([constituency, wards]) => (
                <div key={constituency} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">{constituency}</h3>
                    <button
                      type="button"
                      onClick={() => removeConstituency(constituency)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {wards.map((ward, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{ward}</span>
                        <button
                          type="button"
                          onClick={() => removeWard(constituency, ward)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2 mt-3">
                    <input
                      type="text"
                      value={newWard}
                      onChange={(e) => setNewWard(e.target.value)}
                      placeholder="Add new ward"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => addWard(constituency)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Ward
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Locations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;
