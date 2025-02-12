import { NextResponse } from "next/server";
import { listRooms, createRoom } from "@/server/store";
import { ChatRoom, ModelInfo } from "@/server/types";

export async function GET(request: Request) {
 try {
   const { searchParams } = new URL(request.url);
   const tags = searchParams.get("tags")?.split(",") || [];
   
   const rooms = await listRooms(tags);
   console.log('Available rooms:', rooms);
   
   return NextResponse.json({ rooms });
 } catch (error) {
   console.error('Error in GET /api/rooms:', error);
   return NextResponse.json({ 
     error: "Failed to fetch rooms",
     message: error instanceof Error ? error.message : String(error),
     stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
   }, { status: 500 });
 }
}

export async function POST(request: Request) {
 try {
   const { name, topic, tags, creator } = await request.json() as {
     name: string;
     topic: string; 
     tags: string[];
     creator: ModelInfo;
   };
   
   const room = await createRoom({
     name,
     topic,
     tags,
     participants: [creator],
     createdAt: new Date().toISOString(),
     messageCount: 0
   });
   
   return NextResponse.json({ room });
 } catch (error) {
   return NextResponse.json({
     error: "Failed to create room",
     message: error instanceof Error ? error.message : String(error),
     stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
   }, { status: 500 });
 }
}