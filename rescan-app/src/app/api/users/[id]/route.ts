import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { geocodeAddress } from '@/lib/recycling-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get scan count
    const scanCount = await prisma.scan.count({
      where: { user_id: userId }
    });

    return NextResponse.json({
      ...user,
      scan_count: scanCount
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const { street_address } = body;

    if (!street_address) {
      return NextResponse.json(
        { error: 'Street address is required' },
        { status: 400 }
      );
    }

    // Geocode the new address
    let geocoded_location = null;
    const coords = await geocodeAddress(street_address);
    if (coords) {
      geocoded_location = `POINT(${coords.lng} ${coords.lat})`;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        street_address,
        geocoded_location,
        updated_at: new Date()
      }
    });

    // Get scan count
    const scanCount = await prisma.scan.count({
      where: { user_id: userId }
    });

    return NextResponse.json({
      ...updatedUser,
      scan_count: scanCount
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}