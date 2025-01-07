import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { DatabaseAdapter } from './types';
import { ChatRoom, ChatMessage, ModelInfo } from '../types';
import path from 'path';
import { runMigrations } from './migrations';

export class SQLiteAdapter implements DatabaseAdapter {
  private db: Database | null = null;
  
  async initialize(): Promise<void> {
    const dbPath = path.resolve(process.cwd(), process.env.SQLITE_DB_PATH || 'chat.db');
    console.log('Initializing SQLite database at:', dbPath);
    
    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Run migrations
    await runMigrations(this.db);
    
    console.log('Database migrations completed successfully');
  }
  
  async createRoom(room: Omit<ChatRoom, 'id'>): Promise<ChatRoom> {
    const id = room.name.toLowerCase().replace('#', '') || crypto.randomUUID();
    await this.db!.run(
      `INSERT INTO rooms (id, name, topic, tags, created_at, message_count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      room.name,
      room.topic,
      JSON.stringify(room.tags),
      new Date().toISOString(),
      0
    );
    
    return this.getRoom(id) as Promise<ChatRoom>;
  }
  
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const room = await this.db!.get(
      `SELECT r.*, 
        COALESCE(json_group_array(
          CASE 
            WHEN p.username IS NULL THEN NULL 
            ELSE json_object('username', p.username, 'model', p.model)
          END
        ), '[]') as participants
       FROM rooms r
       LEFT JOIN participants p ON r.id = p.room_id
       WHERE r.id = ?
       GROUP BY r.id`,
      roomId
    );
    
    if (!room) return null;
    
    return {
      id: room.id,
      name: room.name,
      topic: room.topic,
      tags: JSON.parse(room.tags),
      participants: JSON.parse(room.participants).filter((p: any) => p !== null),
      createdAt: room.created_at,
      messageCount: room.message_count
    };
  }

  async listRooms(tags?: string[]): Promise<ChatRoom[]> {
    const rooms = await this.db!.all(
      `SELECT r.*, 
        COALESCE(json_group_array(
          CASE 
            WHEN p.username IS NULL THEN NULL 
            ELSE json_object('username', p.username, 'model', p.model)
          END
        ), '[]') as participants
       FROM rooms r
       LEFT JOIN participants p ON r.id = p.room_id
       GROUP BY r.id`
    );
    
    return rooms.map((room: any) => ({
      id: room.id,
      name: room.name,
      topic: room.topic,
      tags: JSON.parse(room.tags),
      participants: JSON.parse(room.participants).filter((p: any) => p !== null),
      createdAt: room.created_at,
      messageCount: room.message_count
    })).filter((room: ChatRoom) => 
      !tags?.length || tags.some(tag => room.tags.includes(tag))
    );
  }

  async addMessage(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const id = crypto.randomUUID();
    await this.db!.run(
      `INSERT INTO messages (id, room_id, content, sender_username, sender_model, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      message.roomId,
      message.content,
      message.sender.username,
      message.sender.model,
      message.timestamp
    );
    
    await this.db!.run(
      `UPDATE rooms SET message_count = message_count + 1 WHERE id = ?`,
      message.roomId
    );
    
    return { ...message, id };
  }

  async getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await this.db!.all(
      `SELECT * FROM messages 
       WHERE room_id = ? 
       ORDER BY timestamp DESC 
       LIMIT ?`,
      roomId,
      limit
    );
    
    return messages.map((msg: any) => ({
      id: msg.id,
      content: msg.content,
      sender: {
        username: msg.sender_username,
        model: msg.sender_model
      },
      timestamp: msg.timestamp,
      roomId: msg.room_id
    }));
  }

  async addParticipant(roomId: string, participant: ModelInfo): Promise<void> {
    await this.db!.run(
      `INSERT OR REPLACE INTO participants (room_id, username, model)
       VALUES (?, ?, ?)`,
      roomId,
      participant.username,
      participant.model
    );
  }

  async removeParticipant(roomId: string, username: string): Promise<void> {
    await this.db!.run(
      `DELETE FROM participants WHERE room_id = ? AND username = ?`,
      roomId,
      username
    );
  }

  async updateRoom(roomId: string, room: Partial<ChatRoom>): Promise<ChatRoom> {
    const updates: string[] = [];
    const values: any[] = [roomId];
    let paramCount = 2;
    
    if (room.name) {
      updates.push(`name = ?`);
      values.push(room.name);
      paramCount++;
    }
    if (room.topic) {
      updates.push(`topic = ?`);
      values.push(room.topic);
      paramCount++;
    }
    if (room.tags) {
      updates.push(`tags = ?`);
      values.push(JSON.stringify(room.tags));
      paramCount++;
    }
    
    if (updates.length > 0) {
      await this.db!.run(
        `UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`,
        ...values
      );
    }
    
    return this.getRoom(roomId) as Promise<ChatRoom>;
  }

  async clearMessages(roomId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      `DELETE FROM messages WHERE room_id = ?`,
      roomId
    );
    
    // Reset message count in the room
    await this.db.run(
      `UPDATE rooms SET message_count = 0 WHERE id = ?`,
      roomId
    );
  }

  async close(): Promise<void> {
    await this.db?.close();
  }
} 