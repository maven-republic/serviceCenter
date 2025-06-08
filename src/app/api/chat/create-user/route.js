// pages/api/chat/create-user.ts (server-side API route)
import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export async function POST(req) {
  const { id, name } = await req.json();  
  
  try {
    await serverClient.upsertUser({
      id,      // e.g., user ID from your DB
      name     // display name
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to upsert user:', error);
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
  }
}
