const teacherInput = document.getElementById('teacherInput');
const askTeacherBtn = document.getElementById('askTeacherBtn');
const teacherOutput = document.getElementById('teacherOutput');
const topicSelect = document.getElementById('topic');

const translatorInput = document.getElementById('translatorInput');
const translateBtn = document.getElementById('translateBtn');
const translatorOutput = document.getElementById('translatorOutput');

askTeacherBtn.addEventListener('click', async () => {
  const message = teacherInput.value.trim();
  const topic = topicSelect.value;

  if (!message) {
    teacherOutput.innerHTML = '<p class="muted">Please type a question first.</p>';
    return;
  }

  teacherOutput.innerHTML = '<p class="muted">Thinking...</p>';

  try {
    const res = await fetch('/api/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, topic })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Teacher request failed');
    }

    teacherOutput.innerHTML = `
      <p><strong>Feedback:</strong> ${data.feedback}</p>
      <p><strong>Mini lesson:</strong></p>
      <ul>${data.miniLesson.map((item) => `<li>${item}</li>`).join('')}</ul>
      <p><strong>Pronunciation tip:</strong> ${data.pronunciationTip}</p>
      <p><strong>Grammar tip:</strong> ${data.grammarTip}</p>
      <p><strong>Challenge:</strong> ${data.challenge}</p>
    `;
  } catch (error) {
    teacherOutput.innerHTML = `<p class="muted">${error.message}</p>`;
  }
});

translateBtn.addEventListener('click', async () => {
  const text = translatorInput.value.trim();

  if (!text) {
    translatorOutput.innerHTML = '<p class="muted">Please type text to translate.</p>';
    return;
  }

  translatorOutput.innerHTML = '<p class="muted">Translating...</p>';

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Translation failed');
    }

    translatorOutput.innerHTML = `
      <p><strong>German:</strong> ${data.translated}</p>
      <p class="muted">Tip: this is a starter translation model; ask the AI Teacher for context and corrections.</p>
    `;
  } catch (error) {
    translatorOutput.innerHTML = `<p class="muted">${error.message}</p>`;
  }
});
