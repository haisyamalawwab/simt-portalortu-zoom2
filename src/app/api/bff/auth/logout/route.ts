import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================
// BFF: Logout
// Invalidates token on backend and clears cookies
// ============================================================

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('simt_token')?.value;

    // Call backend logout if token exists
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      } catch {
        // Ignore backend errors, proceed with local logout
      }
    }

    // Clear cookies
    cookieStore.delete('simt_token');
    cookieStore.delete('simt_tenant');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Still return success even if there's an error
    return NextResponse.json({ success: true });
  }
}
