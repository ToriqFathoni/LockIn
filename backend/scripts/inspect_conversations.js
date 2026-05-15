const db = require('../database');

(async () => {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='conversations' ORDER BY ordinal_position");
    console.log('Conversations schema:');
    res.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type}`));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    process.exit(0);
  }
})();
