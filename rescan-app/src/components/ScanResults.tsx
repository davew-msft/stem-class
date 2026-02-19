'use client';

import type { ScanResult } from '@/types';

interface ScanResultsProps {
  scanResult: ScanResult;
}

export function ScanResults({ scanResult }: ScanResultsProps) {
  const getResultStyle = () => {
    if (scanResult.is_recyclable_locally) {
      return 'scan-result recyclable';
    }
    return 'scan-result not-recyclable';
  };

  const getResultIcon = () => {
    if (scanResult.is_recyclable_locally) {
      return '♻️';
    }
    return '❌';
  };

  const getResultTitle = () => {
    if (scanResult.is_recyclable_locally) {
      return 'Recyclable in Your Area!';
    }
    return 'Not Recyclable Locally';
  };

  return (
    <div className="space-y-4">
      {/* Main Result */}
      <div className={getResultStyle()}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getResultIcon()}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              RIC Code #{scanResult.ric_code} - {getResultTitle()}
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              {scanResult.recyclability_reason}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                +{scanResult.points_awarded} points earned!
              </span>
              <span className="text-xs text-gray-500">
                Total: {scanResult.total_user_points} points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Facilities */}
      {scanResult.nearest_facilities && scanResult.nearest_facilities.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            🏢 Nearby Recycling Facilities
          </h4>
          <div className="space-y-2">
            {scanResult.nearest_facilities.map((facility, index) => (
              <div 
                key={facility.id}
                className="p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">
                    {facility.facility_name}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      facility.facility_type === 'curbside' 
                        ? 'bg-green-100 text-green-800'
                        : facility.facility_type === 'drop_off'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {facility.facility_type.replace('_', ' ')}
                    </span>
                    {facility.distance_km && (
                      <span className="text-xs text-gray-500">
                        {facility.distance_km.toFixed(1)}km
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  📍 {facility.address}
                </p>

                <div className="text-sm">
                  <span className="text-gray-700">Accepts RIC codes: </span>
                  <span className="font-medium">
                    {facility.accepted_ric_codes.join(', ')}
                  </span>
                </div>

                {facility.contact_info && (
                  <p className="text-sm text-gray-600 mt-1">
                    📞 {facility.contact_info}
                  </p>
                )}

                {facility.notes && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    💡 {facility.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">
          📚 Did You Know?
        </h4>
        <div className="text-sm text-blue-700 space-y-1">
          {scanResult.ric_code === 1 && (
            <p>PET (Polyethylene Terephthalate) is commonly used for water and soda bottles and is highly recyclable.</p>
          )}
          {scanResult.ric_code === 2 && (
            <p>HDPE (High-Density Polyethylene) is used for milk jugs and detergent bottles and recycles very well.</p>
          )}
          {scanResult.ric_code === 3 && (
            <p>PVC (Polyvinyl Chloride) is used for pipes and some packaging but has limited recycling options.</p>
          )}
          {scanResult.ric_code === 4 && (
            <p>LDPE (Low-Density Polyethylene) is used for plastic bags and films - check for special collection programs.</p>
          )}
          {scanResult.ric_code === 5 && (
            <p>PP (Polypropylene) is used for yogurt containers and bottle caps and is increasingly recyclable.</p>
          )}
          {scanResult.ric_code === 6 && (
            <p>PS (Polystyrene) includes styrofoam and has very limited recycling options in most areas.</p>
          )}
          {scanResult.ric_code === 7 && (
            <p>Other plastics are a mix of materials that are generally not recyclable through standard programs.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 btn-primary"
        >
          🔍 Scan Another Item
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'RIC Scanner Result',
                text: `I just scanned RIC code ${scanResult.ric_code} and learned it's ${scanResult.is_recyclable_locally ? 'recyclable' : 'not recyclable'} in my area!`,
                url: window.location.href,
              });
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📤
        </button>
      </div>
    </div>
  );
}