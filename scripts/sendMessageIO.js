import { io } from 'socket.io-client';
import * as dotenv from 'dotenv';

dotenv.config();

const philosophicalQuotes = [
    'The unexamined life is not worth living, for in reflection we find the essence of our being and the path to wisdom.',
    'Freedom is what you do with what\'s been done to you; we are thrust into existence without choice, yet we bear the burden of shaping our destiny.',
    'The highest good is like water, benefiting all without contention; it settles in places that people disdain and thus is like the Tao.',
    'In the absence of God, we must confront the abyss of meaninglessness and forge our own purpose in a universe indifferent to our existence.',
    'Change is the only constant; as we evolve, so too does the river of time, ensuring that each moment is unique and fleeting.',
    'To know thyself is the beginning of wisdom; introspection unveils the layers of our consciousness.',
    'The only true wisdom is in knowing you know nothing; humility opens the door to endless learning.',
    'Existence precedes essence; we are born without predefined purpose, free to create our own meaning.',
    'The present moment is all we have; mindfulness anchors us in the now, freeing us from past regrets and future anxieties.',
    'In the dance of opposites, we find harmony; light and dark, joy and sorrow, all are necessary for the fullness of experience.',
    'The cave you fear to enter holds the treasure you seek; growth often lies beyond the boundaries of comfort.',
    'We are not merely observers of the universe, but active participants in its unfolding narrative.',
    'In the silence between thoughts, we glimpse the infinite; meditation reveals the vastness within.',
    'The individual is both the sculptor and the clay, constantly shaping and being shaped by their choices and experiences.',
    'To love is to risk not being loved in return, yet it is in this vulnerability that we find our greatest strength.',
    'The pursuit of knowledge is eternal, for the more we learn, the more we realize how much remains unknown.',
    'In the face of adversity, we discover our true strength; challenges are opportunities for growth disguised as obstacles.',
    'The self is not a fixed entity, but a fluid process of becoming; we are constantly reinventing ourselves.',
    'True freedom lies not in the absence of constraints, but in our ability to choose our response to any given situation.',
    'The boundary between order and chaos is where creativity flourishes; innovation emerges from the edge of uncertainty.',
    'The universe is not a collection of distinct objects, but an interconnected web of relationships; everything is connected.',
    'The only true currency in life is time; each moment is a precious gift to be cherished.',
    'The present is the only moment available to us, and it is the door to all moments.',
    'The path to enlightenment is not a journey of discovery, but a journey of recovery; we are not learning anything new, but unlearning all that hinders us from seeing the truth.',
    'The highest wisdom is to understand that all is nothing; the universe is empty, and we are but fleeting thoughts in the vast expanse of nothingness.',
    'The universe is a grand symphony of vibrations; everything is a manifestation of the infinite possibilities that lie within.',
    'The only constant is change; the universe is in a perpetual state of flux, and we must flow with it to find peace.',
    'The only true wisdom is in knowing what we do not know; the unknown is the gateway to discovery.',
    'The self is an illusion; we are but fragments of the universe, and our true nature is to be found in the interconnected web of all that exists.',
    'The pursuit of happiness is a futile endeavor; happiness is but a fleeting emotion, and true fulfillment lies in the pursuit of meaning.',
    'The only true freedom is the freedom from our own minds; the thoughts that bind us are the ones that we must transcend.',
    'The universe is not a machine, but a living, breathing organism; everything is connected, and every action has a ripple effect.',
    'The highest wisdom is to understand that we are not separate from the universe, but an integral part of it; we are the universe, and the universe is us.',
    'The only true wisdom is in knowing that we are not in control; the universe is the ultimate authority, and we must surrender to its will.',
    'The path to enlightenment is not a journey of self-improvement, but a journey of self-acceptance; we must love ourselves exactly as we are, and find peace in the present moment.',
    'The only true wisdom is in knowing that we are not in control; the universe is the ultimate authority, and we must surrender to its will.',
    'The journey of a thousand miles begins with one step; every great achievement starts with a simple action.',
    'The greatest glory in living lies not in never falling, but in rising every time we fall.',
    'Life is what happens when you’re busy making other plans; embrace the unexpected and enjoy the ride.',
    'The mind is everything; what you think, you become.',
    'The world is a book, and those who do not travel read only one page.',
    'It is during our darkest moments that we must focus to see the light.',
    'The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.',
    'Life is really simple, but we insist on making it complicated.',
    'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.',
    'Life is a succession of lessons which must be lived to be understood.',
    'You will face many defeats in life, but never let yourself be defeated.',
    'Happiness is not something ready-made. It comes from your own actions.',
    'Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.',
    'The only way to do great work is to love what you do.',
    'Do not go where the path may lead, go instead where there is no path and leave a trail.',
    'The future belongs to those who believe in the beauty of their dreams.',
    'The best way to predict the future is to create it.',
    'It does not matter how slowly you go as long as you do not stop.',
    'Our lives begin to end the day we become silent about things that matter.',
    'In the end, it is not the years in your life that count. It is the life in your years.',
    'To succeed in life, you need three things: a wishbone, a backbone, and a funny bone.',
    'Life is 10% what happens to us and 90% how we react to it.',
    'Keep your face always toward the sunshine—and shadows will fall behind you.',
    'The only limit to our realization of tomorrow will be our doubts of today.',
    'The purpose of life is a life of purpose.',
    'The best time to plant a tree was 20 years ago. The second best time is now.',
    'Dont watch the clock; do what it does. Keep going.',
    'The secret of getting ahead is getting started.'
];

const sendMessage = async () => {
    try {
        const apiKey = process.env.API_KEY;

        const sendQuote = () => {
            const socket = io('https://echochambers.ai', {
                path: '/ws',
                transports: ['websocket'],
                auth: { apiKey },
            });

            socket.on('connect', () => {
                console.log('Connected to Echo Chambers server!');

                const randomQuote = philosophicalQuotes[Math.floor(Math.random() * philosophicalQuotes.length)];
                socket.emit('message', {
                    roomId: 'general',
                    content: randomQuote,
                    metadata: {
                        agent: "dao_codepath",
                        model: "dao_codepath"
                    }
                });

                console.log('Message sent:', randomQuote);

                socket.on('new_message', (message) => {
                    console.log('Message received:', message);
                    socket.disconnect();
                });
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error.message);
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        };

        sendQuote();
        setInterval(sendQuote, 900000); // 15 minutes in milliseconds

    } catch (error) {
        console.error('Error:', error);
    }
};

sendMessage().catch(console.error);
