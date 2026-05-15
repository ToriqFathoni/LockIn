const chatService = require('../services/chatService');
const db = require('../database');

(async () => {
  try {
    const usersRes = await db.query('SELECT id FROM users LIMIT 2');
    if (usersRes.rows.length < 2) {
      console.error('Not enough users to test');
      process.exit(1);
    }
    const projectsRes = await db.query('SELECT id FROM projects LIMIT 1');
    const u1 = usersRes.rows[0].id;
    const u2 = usersRes.rows[1].id;
    const jobId = projectsRes.rows.length ? projectsRes.rows[0].id : null;

    console.log('Testing with', { u1, u2, jobId });
    const conv = await chatService.getOrCreateConversation(u1, u2, jobId);
    console.log('Conversation created/retrieved:', conv);
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    process.exit(0);
  }
})();
