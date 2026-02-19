'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import Tesseract from 'tesseract.js';
import type { LocationRequest, ScanResult } from '@/types';

interface RicScannerProps {
  userId: string;
  userLocation?: LocationRequest;
  onScanComplete: (result: ScanResult) => void;
}

export function RicScanner({ userId, userLocation, onScanComplete }: RicScannerProps) {
  const cameraRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [manualRicCode, setManualRicCode] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState(false);

  const processRicScan = async (ricCode: string) => {
    if (!ricCode || !/^[1-7]$/.test(ricCode)) {
      setError('Invalid RIC code. Please enter a number between 1-7.');
      return;
    }

    try {
      setScanProgress('Checking recyclability...');
      
      const response = await fetch(`/api/ric-codes/${ricCode}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          scan_method: isManualMode ? 'manual_entry' : 'camera',
          location: userLocation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process scan');
      }

      const result: ScanResult = await response.json();
      onScanComplete(result);
      setError('');
      setScanProgress('');
    } catch (err) {
      setError('Failed to process scan. Please try again.');
      console.error('Scan processing error:', err);
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  };

  const handleCameraScan = useCallback(async () => {
    if (!cameraRef.current || isScanning) return;

    try {
      setIsScanning(true);
      setError('');
      setScanProgress('Taking photo...');

      // Capture image from camera
      const image = cameraRef.current.takePhoto();
      
      setScanProgress('Processing image...');

      // Use Tesseract to extract text from image
      const { data: { text } } = await Tesseract.recognize(image, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanProgress(`Reading text... ${Math.round(m.progress * 100)}%`);
          }
        },
        whitelist: '1234567', // Only recognize RIC codes 1-7
      });

      setScanProgress('Analyzing RIC code...');

      // Extract RIC code from recognized text
      const ricMatch = text.match(/[1-7]/);
      if (ricMatch) {
        const ricCode = ricMatch[0];
        await processRicScan(ricCode);
      } else {
        setError('No RIC code detected. Please ensure the recycling symbol is clearly visible and try again.');
        setIsScanning(false);
      }
    } catch (err) {
      setError('Camera scan failed. Please try manual entry.');
      setIsScanning(false);
      setScanProgress('');
      console.error('Camera scan error:', err);
    }
  }, [isScanning, userId, userLocation, isManualMode]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRicCode.trim()) return;

    setIsScanning(true);
    await processRicScan(manualRicCode.trim());
    setManualRicCode('');
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsManualMode(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !isManualMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📷 Camera Scan
        </button>
        <button
          onClick={() => setIsManualMode(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isManualMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⌨️ Manual Entry
        </button>
      </div>

      {/* Camera Interface */}
      {!isManualMode && (
        <div className="space-y-4">
          <div className="camera-container aspect-camera bg-gray-900 rounded-lg overflow-hidden">
            <Camera
              ref={cameraRef}
              aspectRatio={4/3}
              errorMessages={{
                noCameraAccessible: 'No camera accessible. Please grant camera permissions or use manual entry.',
                permissionDenied: 'Permission denied. Please refresh and allow camera access.',
                switchCamera: 'Unable to switch camera',
                canvas: 'Canvas is not supported'
              }}
            />
          </div>
          
          <button
            onClick={handleCameraScan}
            disabled={isScanning}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                {scanProgress || 'Scanning...'}
              </span>
            ) : (
              '📸 Scan RIC Code'
            )}
          </button>
        </div>
      )}

      {/* Manual Entry Interface */}
      {isManualMode && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label htmlFor="ricCode" className="block text-sm font-medium text-gray-700 mb-2">
              Enter RIC Code (1-7)
            </label>
            <input
              type="number"
              id="ricCode"
              min="1"
              max="7"
              value={manualRicCode}
              onChange={(e) => setManualRicCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter 1, 2, 3, 4, 5, 6, or 7"
              disabled={isScanning}
            />
          </div>
          
          <button
            type="submit"
            disabled={isScanning || !manualRicCode.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                {scanProgress || 'Processing...'}
              </span>
            ) : (
              '🔍 Check Recyclability'
            )}
          </button>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">How to Scan:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Look for the triangular recycling symbol on plastic products</li>
          <li>• Ensure good lighting and hold the camera steady</li>
          <li>• The number inside the symbol is the RIC code (1-7)</li>
          <li>• If camera isn't working, use manual entry mode</li>
        </ul>
      </div>
    </div>
  );
}