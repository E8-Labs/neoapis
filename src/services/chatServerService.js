const WebSocket = require('ws');
const OpenAI = require('openai');
const openai = new OpenAI();

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    console.log('Received message from client:', message);

    // Process the OpenAI completion request when a message is received
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: message }
      ],
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0].delta.content;
      console.log(content);

      // Send each chunk to the connected client
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(content);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
