import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRicCodeInfo, checkRecyclabilityAtLocation, SAMPLE_RECYCLING_FACILITIES } from '@/lib/recycling-data';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const ricCode = parseInt(params.code);
    const body = await request.json();
    const { user_id, scan_method, location } = body;

    // Validate RIC code
    if (isNaN(ricCode) || ricCode < 1 || ricCode > 7) {
      return NextResponse.json(
        { error: 'Invalid RIC code. Must be between 1 and 7.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!user_id || !scan_method) {
      return NextResponse.json(
        { error: 'User ID and scan method are required' },
        { status: 400 }
      );
    }

    // Get RIC code information
    const ricInfo = getRicCodeInfo(ricCode);
    if (!ricInfo) {
      return NextResponse.json(
        { error: 'RIC code information not found' },
        { status: 404 }
      );
    }

    // Get user to verify they exist
    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check recyclability based on location
    // For now, use sample facilities. In production, query actual facility database
    const recyclabilityCheck = checkRecyclabilityAtLocation(ricCode, SAMPLE_RECYCLING_FACILITIES);
    
    if (!recyclabilityCheck) {
      return NextResponse.json(
        { error: 'Unable to determine recyclability' },
        { status: 500 }
      );
    }

    // Award points (always award at least 1 point for engagement)
    const pointsAwarded = recyclabilityCheck.is_recyclable ? 2 : 1;

    // Create scan record
    const scan = await prisma.scan.create({
      data: {
        id: uuidv4(),
        user_id: user_id,
        ric_code: ricCode,
        is_recyclable_locally: recyclabilityCheck.is_recyclable,
        points_awarded: pointsAwarded,
        scan_method: scan_method,
        location_used: user.geocoded_location,
        created_at: new Date()
      }
    });

    // Update user points and last scan time
    const updatedUser = await prisma.user.update({
      where: { id: user_id },
      data: {
        total_points: {
          increment: pointsAwarded
        },
        last_scan_at: new Date()
      }
    });

    // Format response
    const response = {
      scan_id: scan.id,
      ric_code: ricCode,
      is_recyclable_locally: recyclabilityCheck.is_recyclable,
      points_awarded: pointsAwarded,
      recyclability_reason: recyclabilityCheck.reason,
      nearest_facilities: recyclabilityCheck.facilities.map(facility => ({
        id: facility.id,
        facility_name: facility.facility_name,
        accepted_ric_codes: facility.accepted_ric_codes,
        facility_type: facility.facility_type,
        address: facility.address,
        contact_info: facility.contact_info,
        notes: facility.notes,
        distance_km: 2.5 // Mock distance for now
      })),
      total_user_points: updatedUser.total_points
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing RIC scan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}