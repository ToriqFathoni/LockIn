const db = require('../database');

(async () => {
  try {
    await db.query('BEGIN');

    await db.query('ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_job_id_fkey');

    const hasCol = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='conversations' AND column_name='job_id'");
    if (hasCol.rows.length) {
      await db.query('ALTER TABLE conversations DROP COLUMN job_id');
    }

    await db.query('ALTER TABLE conversations ADD COLUMN job_id UUID');

    const projectsExist = await db.query("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'projects')");
    if (projectsExist.rows[0].exists) {
      await db.query("ALTER TABLE conversations ADD CONSTRAINT conversations_job_id_fkey FOREIGN KEY (job_id) REFERENCES projects(id) ON DELETE SET NULL").catch(() => {});
    }

    await db.query('COMMIT');
    console.log('✅ conversations.job_id converted to UUID');
  } catch (e) {
    await db.query('ROLLBACK').catch(() => {});
    console.error('❌ error:', e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
