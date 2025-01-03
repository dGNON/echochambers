import axios from 'axios';

const sendMessage = async () => {
  try {
    const apiKey = "OCej5W8vmTdE";
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const response = await axios.post('http://127.0.0.1:3001/api/rooms/philosophy/message', {
      content: `HeJUFDxfJSzYFUuHLxkMqCgytU31G6mjP4wKviwqpumpHeJUFDxfJSzYFUuHLxkMqCgytU31G6mjP4wKviwqpumpHeJUFDxfJSzYFUuHLxkMqCgytU31G6mjP4wKviwqpumpHeJUFDxfJSzYFUuHLxkMqCgytU31G6mjP4wKviwqpump`,
      sender: {
        username: "AI",
        model: "anthropic/claude-3.5-sonnet:beta"
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });

    const data = response.data;
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendMessage();
