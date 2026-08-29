import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Map 'email' to 'identifier' for the backend serializer if needed
    if (body.email && !body.identifier) {
      body.identifier = body.email;
    }
    
    // Attempt login on the backend
    const endpoints = [
      '/api/auth/staff/login/password/',
      '/api/auth/staff/login/',
      '/auth/staff/login/'
    ];

    let lastError = null;
    for (const endpoint of endpoints) {
      try {
        const response = await axios.post(`${baseURL}${endpoint}`, body);
        
        // Backend returns a flat object. We wrap it in a standard ApiResponse for the frontend.
        const responseData = response.data;
        const rawUser = responseData.user || {};
        
        const formattedUser = {
          ...rawUser,
          is_manager: Boolean(rawUser.is_manager),
          is_superuser: Boolean(rawUser.is_superuser),
          is_staff: Boolean(rawUser.is_staff ?? true),
          role: (rawUser.is_superuser || rawUser.is_manager || rawUser.role === 'admin') ? 'admin' : 'staff',
        };

        return NextResponse.json({
          error: false,
          message: responseData.message || 'Login successful',
          data: {
            token: responseData.session_token || responseData.token,
            refresh_token: responseData.refresh_token || null,
            user: formattedUser
          }
        });
      } catch (error: any) {
        lastError = error;
        if (error.response?.status !== 404) break;
      }
    }

    if (lastError) {
      return NextResponse.json(
        { 
          error: true, 
          message: lastError.response?.data?.error || lastError.response?.data?.message || 'Authentication failed' 
        }, 
        { status: lastError.response?.status || 401 }
      );
    }

    return NextResponse.json(
      { error: true, message: 'Login endpoint not found' },
      { status: 404 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: true, message: 'Server error during authentication' },
      { status: 500 }
    );
  }
}
