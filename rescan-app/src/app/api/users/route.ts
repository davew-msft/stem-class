import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeAddress } from '@/lib/recycling-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, street_address } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { session_id }
    });

    if (existingUser) {
      // Return existing user with scan count
      const scanCount = await prisma.scan.count({
        where: { user_id: existingUser.id }
      });

      return NextResponse.json({
        ...existingUser,
        scan_count: scanCount
      });
    }

    // Geocode address if provided
    let geocoded_location = null;
    if (street_address) {
      const coords = await geocodeAddress(street_address);
      if (coords) {
        geocoded_location = `POINT(${coords.lng} ${coords.lat})`;
      }
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        session_id,
        street_address: street_address || null,
        geocoded_location,
        total_points: 0
      }
    });

    return NextResponse.json({
      ...newUser,
      scan_count: 0
    });

  } catch (error) {
    console.error('Error creating/fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}