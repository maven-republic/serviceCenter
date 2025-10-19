import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

export async function POST(req) {
  const { id, name } = await req.json();
console.log('id', id);
  console.log('name', name);
  const token = serverClient.createToken(id);

  return NextResponse.json({ token });
}
