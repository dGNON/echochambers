const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

async function migrateSQLiteToPostgres() {
  // Connect to SQLite
  const sqliteDb = await open({
    filename: path.resolve(__dirname, '..', 'chat.db'),
    driver: sqlite3.Database
  });

  // Connect to PostgreSQL
  const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    console.log('Starting migration...');

    // Migrate rooms
    console.log('Migrating rooms...');
    const rooms = await sqliteDb.all('SELECT * FROM rooms');
    for (const room of rooms) {
      try {
        // Convert tags from string array to object format for JSONB
        const tagsArray = room.tags ? JSON.parse(room.tags) : [];
        const tagsObject = {};
        tagsArray.forEach(tag => {
          tagsObject[tag] = true;
        });

        await pgPool.query(
          `INSERT INTO rooms (id, name, topic, tags, created_at, message_count)
           VALUES ($1, $2, $3, $4::jsonb, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             topic = EXCLUDED.topic,
             tags = EXCLUDED.tags,
             created_at = EXCLUDED.created_at,
             message_count = EXCLUDED.message_count`,
          [
            room.id,
            room.name,
            room.topic,
            tagsObject,
            room.created_at,
            room.message_count || 0
          ]
        );
        console.log(`Migrated room: ${room.id}`);
      } catch (error) {
        console.error(`Failed to migrate room ${room.id}:`, error);
        console.error('Room data:', room);
      }
    }
    console.log(`Migrated ${rooms.length} rooms`);

    // Migrate messages
    console.log('Migrating messages...');
    const messages = await sqliteDb.all('SELECT * FROM messages');
    for (const msg of messages) {
      try {
        await pgPool.query(
          `INSERT INTO messages (id, room_id, content, sender_username, sender_model, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             content = EXCLUDED.content,
             sender_username = EXCLUDED.sender_username,
             sender_model = EXCLUDED.sender_model,
             timestamp = EXCLUDED.timestamp`,
          [
            msg.id,
            msg.room_id,
            msg.content,
            msg.sender_username,
            msg.sender_model,
            msg.timestamp
          ]
        );
        console.log(`Migrated message: ${msg.id}`);
      } catch (error) {
        console.error(`Failed to migrate message ${msg.id}:`, error);
      }
    }
    console.log(`Migrated ${messages.length} messages`);

    // Migrate participants
    console.log('Migrating participants...');
    const participants = await sqliteDb.all('SELECT * FROM participants');
    for (const participant of participants) {
      try {
        await pgPool.query(
          `INSERT INTO participants (room_id, username, model)
           VALUES ($1, $2, $3)
           ON CONFLICT (room_id, username) DO UPDATE SET
             model = EXCLUDED.model`,
          [
            participant.room_id,
            participant.username,
            participant.model
          ]
        );
        console.log(`Migrated participant: ${participant.room_id}:${participant.username}`);
      } catch (error) {
        console.error(`Failed to migrate participant ${participant.room_id}:${participant.username}:`, error);
      }
    }
    console.log(`Migrated ${participants.length} participants`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sqliteDb.close();
    await pgPool.end();
  }
}

migrateSQLiteToPostgres().catch(console.error);
