const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

const fallbackDictionary = {
  hello: 'hallo',
  good: 'gut',
  morning: 'morgen',
  night: 'nacht',
  thank: 'danke',
  thanks: 'danke',
  please: 'bitte',
  yes: 'ja',
  no: 'nein',
  where: 'wo',
  is: 'ist',
  train: 'zug',
  station: 'bahnhof',
  water: 'wasser',
  food: 'essen',
  friend: 'freund',
  i: 'ich',
  you: 'du',
  we: 'wir',
  love: 'liebe',
  learn: 'lernen',
  german: 'deutsch'
};

const lessonTopics = {
  greetings: {
    vocab: ['Hallo = Hello', 'Guten Morgen = Good morning', 'Wie geht es dir? = How are you?'],
    tip: 'Use formal "Ihnen" with strangers and "dir" with friends.'
  },
  travel: {
    vocab: ['Wo ist der Bahnhof? = Where is the train station?', 'Ein Ticket, bitte. = One ticket, please.'],
    tip: 'German nouns are capitalized, so Bahnhof starts with a capital B.'
  },
  food: {
    vocab: ['Ich hätte gern Wasser. = I would like water.', 'Die Speisekarte, bitte. = The menu, please.'],
    tip: 'In restaurants, "Ich hätte gern ..." sounds polite and natural.'
  },
  grammar: {
    vocab: ['Ich bin = I am', 'Du bist = You are', 'Wir sind = We are'],
    tip: 'Verb position is crucial: in main clauses, the conjugated verb is usually second.'
  }
};

function translateFallback(text) {
  return text
    .split(/(\s+)/)
    .map((token) => {
      const normalized = token.toLowerCase().replace(/[^a-z]/g, '');
      if (!normalized) return token;
      const translated = fallbackDictionary[normalized];
      if (!translated) return token;
      const punctuation = token.match(/[^a-zA-Z]+$/)?.[0] ?? '';
      return `${translated}${punctuation}`;
    })
    .join('');
}

function buildTeacherResponse(message, topic = 'greetings') {
  const lesson = lessonTopics[topic] || lessonTopics.greetings;

  return {
    feedback: `Great question! In German, you can say: "${translateFallback(message)}" (basic fallback translation).`,
    miniLesson: lesson.vocab,
    pronunciationTip: 'Watch umlauts: ä (eh), ö (as in French "deux"), ü (like saying "ee" with rounded lips).',
    grammarTip: lesson.tip,
    challenge: 'Try writing one sentence in German using today\'s vocabulary. I will correct it!'
  };
}

function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

function handleStatic(req, res) {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];
  const safePath = path.normalize(reqPath).replace(/^\.\.(\/|\\|$)/, '');
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    res.writeHead(200, { 'Content-Type': getContentType(filePath) });
    res.end(data);
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/teacher') {
    try {
      const { message, topic } = await parseBody(req);

      if (!message || typeof message !== 'string') {
        sendJson(res, 400, { error: 'A message is required.' });
        return;
      }

      const response = buildTeacherResponse(message, topic);
      sendJson(res, 200, response);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/translate') {
    try {
      const { text } = await parseBody(req);

      if (!text || typeof text !== 'string') {
        sendJson(res, 400, { error: 'Text is required.' });
        return;
      }

      sendJson(res, 200, { translated: translateFallback(text) });
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === 'GET') {
    handleStatic(req, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`German AI Tutor is running at http://localhost:${port}`);
});
