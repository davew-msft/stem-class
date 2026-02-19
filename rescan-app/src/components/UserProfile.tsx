'use client';

import { useState } from 'react';
import type { User } from '@/types';

interface UserProfileProps {
  user: User;
  onLocationUpdate: (address: string) => void;
}

export function UserProfile({ user, onLocationUpdate }: UserProfileProps) {
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newAddress, setNewAddress] = useState(user.street_address || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    setIsUpdating(true);
    try {
      await onLocationUpdate(newAddress.trim());
      setIsEditingLocation(false);
    } catch (error) {
      console.error('Failed to update location:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="card bg-gradient-to-r from-green-50 to-recycling-50">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            👤 Your Profile
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="text-gray-600">Points:</span>
              <span className="ml-2 font-medium text-green-600">
                ⭐ {user.total_points}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">Scans:</span>
              <span className="ml-2 font-medium text-blue-600">
                📊 {user.scan_count || 0}
              </span>
            </div>
            {user.last_scan_at && (
              <div className="flex items-center">
                <span className="text-gray-600">Last scan:</span>
                <span className="ml-2 text-gray-800">
                  {formatDate(user.last_scan_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl text-green-600 mb-1">🌍</div>
          <div className="text-xs text-gray-500">
            {user.street_address ? 'Location Set' : 'No Location'}
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              📍 Your Location
            </h3>
            {!isEditingLocation ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {user.street_address || 'Not set - using general recycling info'}
                </p>
                <button
                  onClick={() => {
                    setIsEditingLocation(true);
                    setNewAddress(user.street_address || '');
                  }}
                  className="ml-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  {user.street_address ? 'Edit' : 'Add'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleLocationSubmit} className="space-y-2">
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter your street address"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isUpdating}
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={isUpdating || !newAddress.trim()}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingLocation(false);
                      setNewAddress(user.street_address || '');
                    }}
                    disabled={isUpdating}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {user.street_address && (
          <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            ✅ Getting location-specific recycling information
          </div>
        )}
      </div>
    </div>
  );
}