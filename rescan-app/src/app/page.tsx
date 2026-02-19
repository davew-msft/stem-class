'use client';

import { useState, useEffect } from 'react';
import { RicScanner } from '@/components/RicScanner';
import { UserProfile } from '@/components/UserProfile';
import { ScanResults } from '@/components/ScanResults';
import { LocationSetup } from '@/components/LocationSetup';
import type { User, ScanResult } from '@/types';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user session on load
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      
      // Try to get existing user from localStorage
      const existingSessionId = localStorage.getItem('ricScannerSessionId');
      
      let sessionId = existingSessionId;
      if (!sessionId) {
        // Generate new session ID
        sessionId = crypto.randomUUID();
        localStorage.setItem('ricScannerSessionId', sessionId);
      }

      // Create or get user from API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.error('Failed to initialize user');
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanComplete = (scanResult: ScanResult) => {
    setCurrentScan(scanResult);
    // Update user points
    if (user) {
      setUser({
        ...user,
        total_points: scanResult.total_user_points,
        scan_count: user.scan_count + 1,
      });
    }
  };

  const handleLocationUpdate = async (address: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ street_address: address }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing scanner...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to Initialize Scanner
        </h2>
        <p className="text-gray-600 mb-4">
          Please refresh the page or check your connection.
        </p>
        <button 
          onClick={initializeUser}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Scan RIC Codes to Learn About Recycling
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Point your camera at recycling symbols on plastic products to discover 
          if they're recyclable in your area and earn environmental points.
        </p>
      </div>

      {/* User Profile */}
      <UserProfile 
        user={user} 
        onLocationUpdate={handleLocationUpdate}
      />

      {/* Location Setup (if needed) */}
      {!user.street_address && (
        <LocationSetup onLocationSet={handleLocationUpdate} />
      )}

      {/* Main Scanner Interface */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Scanner */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📱 RIC Code Scanner
          </h2>
          <RicScanner 
            userId={user.id}
            userLocation={{
              street_address: user.street_address
            }}
            onScanComplete={handleScanComplete}
          />
        </div>

        {/* Results */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🎯 Scan Results
          </h2>
          {currentScan ? (
            <ScanResults scanResult={currentScan} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>Scan your first RIC code to see results here!</p>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="card bg-gradient-to-r from-green-50 to-blue-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">📷</div>
            <h3 className="font-medium text-gray-900 mb-2">1. Scan</h3>
            <p className="text-sm text-gray-600">
              Use your camera to scan the RIC symbol on plastic products
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🌍</div>
            <h3 className="font-medium text-gray-900 mb-2">2. Learn</h3>
            <p className="text-sm text-gray-600">
              Get location-specific recyclability information
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="font-medium text-gray-900 mb-2">3. Earn</h3>
            <p className="text-sm text-gray-600">
              Earn points for each scan and build environmental awareness
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}