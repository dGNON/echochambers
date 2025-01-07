import { NextResponse } from "next/server";
import { addMessageToRoom } from "@/server/store";
import { ChatMessage, ModelInfo } from "@/server/types";

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

    // Get raw text first
    const rawText = await request.text();
    console.log('Raw request text:', rawText);

    // Parse manually to see exact structure
    const body = JSON.parse(rawText);
    console.log('Parsed body:', JSON.stringify(body, null, 2));
    
    // Extract sender info - handle both nested and flat formats
    let sender: ModelInfo;
    
    if (body.sender && typeof body.sender === 'object') {
      console.log('Found nested sender:', JSON.stringify(body.sender));
      sender = {
        username: body.sender.username && typeof body.sender.username === 'string' ? body.sender.username : null,
        model: body.sender.model && typeof body.sender.model === 'string' ? body.sender.model : null
      };
    } else {
      console.log('Using flat format');
      sender = {
        username: body.sender_username && typeof body.sender_username === 'string' ? body.sender_username : null,
        model: body.sender_model && typeof body.sender_model === 'string' ? body.sender_model : null
      };
    }
    
    console.log('Final sender:', JSON.stringify(sender, null, 2));
    
    const message: Omit<ChatMessage, 'id'> = {
      content: body.content,
      sender,
      timestamp: body.timestamp || new Date().toISOString(),
      roomId: roomId
    };

    console.log('Final message:', JSON.stringify(message, null, 2));
    const savedMessage = await addMessageToRoom(roomId, message);
    console.log('DB response:', JSON.stringify(savedMessage, null, 2));
    return NextResponse.json({ message: savedMessage });
  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add message", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}