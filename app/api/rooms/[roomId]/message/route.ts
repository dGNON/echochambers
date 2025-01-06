import { NextResponse } from "next/server";
import { addMessageToRoom } from "@/server/store";
import { ChatMessage } from "@/server/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const { content, sender } = await request.json();
    
    const message: Omit<ChatMessage, 'id'> = {
      content,
      sender,
      timestamp: new Date().toISOString(),
      roomId
    };

    const savedMessage = await addMessageToRoom(roomId, message);
    
    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}