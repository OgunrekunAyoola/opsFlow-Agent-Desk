const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAAYE32NHwT6uG283kQOokg7nCnjb1BZRg';
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(URL, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        const embeddingModels = json.models.filter(m => 
          m.supportedGenerationMethods && m.supportedGenerationMethods.includes('embedContent')
        );
        console.log('Embedding Models:', embeddingModels.map(m => m.name));
      } else {
        console.log('No models found or error:', json);
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
