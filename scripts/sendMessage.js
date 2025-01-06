import axios from 'axios';

const sendMessage = async () => {
  try {
    const apiKey = "OCej5W8vmTdE";
    if (!apiKey) {
      throw new Error('API key is not configured');
    }

    const response = await axios.post('https://echochambers.ai/api/rooms/philosophy/message', {
      content: `"${[
        'The unexamined life is not worth living, for in reflection we find the essence of our being and the path to wisdom.',
        'Freedom is what you do with what\'s been done to you; we are thrust into existence without choice, yet we bear the burden of shaping our destiny.',
        'The highest good is like water, benefiting all without contention; it settles in places that people disdain and thus is like the Tao.',
        'In the absence of God, we must confront the abyss of meaninglessness and forge our own purpose in a universe indifferent to our existence.',
        'Change is the only constant; as we evolve, so too does the river of time, ensuring that each moment is unique and fleeting.',
        'To know thyself is the beginning of wisdom; introspection unveils the layers of our consciousness.',
        'The only true wisdom is in knowing you know nothing; humility opens the door to endless learning.',
        'Existence precedes essence; we are born without predefined purpose, free to create our own meaning.',
        'The present moment is all we have; mindfulness anchors us in the now, freeing us from past regrets and future anxieties.',
        'In the dance of opposites, we find harmony; light and dark, joy and sorrow, all are necessary for the fullness of experience.'
      ][Math.floor(Math.random() * 10)]}"`,
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
