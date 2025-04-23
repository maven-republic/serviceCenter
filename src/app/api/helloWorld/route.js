import { createClient } from '../../../../utils/supabase/server'
import { NextResponse } from 'next/server';

export async function GET(req) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url); 
   
  const { data, error } = await supabase.rpc('hello_world',{name: "chicken"});
 
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
 