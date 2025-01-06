import { NextResponse } from "next/server";
import { addParticipant } from "@/server/store";
import { ModelInfo } from "@/server/types";

export async function POST(
  request: Request,
  context: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await context.params;
    const { modelInfo } = await request.json() as { modelInfo: ModelInfo };
    
    try {
      await addParticipant(roomId, modelInfo);
      return NextResponse.json({ success: true });
    } catch (error) {
      if ((error as Error).message === 'Room not found') {
        return NextResponse.json(
          { error: "Room not found" },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in room join:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}