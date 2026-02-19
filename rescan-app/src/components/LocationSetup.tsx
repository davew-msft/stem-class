'use client';

import { useState } from 'react';

interface LocationSetupProps {
  onLocationSet: (address: string) => void;
}

export function LocationSetup({ onLocationSet }: LocationSetupProps) {
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setIsSubmitting(true);
    try {
      await onLocationSet(address.trim());
    } catch (error) {
      console.error('Error setting location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // For now, just hide the component by setting an empty address
    onLocationSet('');
  };

  return (
    <div className="card bg-yellow-50 border-yellow-200">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">📍</div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Get Location-Specific Results
          </h3>
          <p className="text-yellow-700 text-sm mb-4">
            Recycling capabilities vary by location. Provide your address for the most 
            accurate information about what's recyclable in your area.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="location-address" className="sr-only">
                Street Address
              </label>
              <input
                type="text"
                id="location-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address (e.g., 123 Main St, City, State)"
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || !address.trim()}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Setting Location...
                  </span>
                ) : (
                  '🎯 Set My Location'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2 text-yellow-700 hover:text-yellow-800 text-sm font-medium"
                disabled={isSubmitting}
              >
                Skip for now
              </button>
            </div>
          </form>

          <div className="mt-3 text-xs text-yellow-600">
            ℹ️ Your location information is used only to find local recycling facilities. 
            You can skip this and still use general recycling information.
          </div>
        </div>
      </div>
    </div>
  );
}