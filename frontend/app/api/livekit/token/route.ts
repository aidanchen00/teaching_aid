import { NextRequest, NextResponse } from 'next/server';
import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantName } = await request.json();

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: 'LiveKit environment variables not configured' },
        { status: 500 }
      );
    }

    const room = roomName || 'learning-room';

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName || `user-${Math.random().toString(36).substring(7)}`,
    });

    at.addGrant({
      room: room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // Explicitly dispatch agent to the room
    try {
      // Convert wss:// to https:// for API calls
      const httpUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://');
      console.log(`[Token] Dispatching agent to room: ${room} via ${httpUrl}`);
      const dispatchClient = new AgentDispatchClient(httpUrl, apiKey, apiSecret);
      const dispatch = await dispatchClient.createDispatch(room, ''); // empty string = default agent
      console.log(`[Token] Dispatched agent to room: ${room}`, dispatch);
    } catch (dispatchError: any) {
      console.error(`[Token] Agent dispatch FAILED:`, dispatchError?.message || dispatchError);
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
