import { NextRequest, NextResponse } from 'next/server';
import { RIC_CODES } from '@/lib/recycling-data';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(RIC_CODES);
  } catch (error) {
    console.error('Error fetching RIC codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}