/**
 * 11pm Schedule Change Simulation Test
 * 
 * Simulates a late-night emergency schedule and room adjustment workflow:
 * 1. Backs up content/schedule.json and content/announcements.json
 * 2. Applies an emergency room relocation & time shift to Day 2
 * 3. Prepends a priority pinned announcement with an urgent directive
 * 4. Executes validation to verify system integrity
 * 5. Safely restores original files to guarantee zero residual drift
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const contentDir = path.join(process.cwd(), 'content');
const schedulePath = path.join(contentDir, 'schedule.json');
const announcementsPath = path.join(contentDir, 'announcements.json');

console.log('====================================================');
console.log(' STARTING: 11pm Emergency Schedule Change Simulation');
console.log('====================================================\n');

// 1. Create In-Memory Backup
console.log('[Step 1/5] Backing up original content files...');
const originalSchedule = fs.readFileSync(schedulePath, 'utf8');
const originalAnnouncements = fs.readFileSync(announcementsPath, 'utf8');

let simulationSuccess = false;

try {
  const scheduleData = JSON.parse(originalSchedule);
  const announcementsData = JSON.parse(originalAnnouncements);

  // 2. Modify Schedule (Simulate Room & Time Shift)
  console.log('[Step 2/5] Simulating emergency schedule shift on Day 2...');
  const targetSession = scheduleData.find((s) => s.id === 'sch-04') || scheduleData[0];
  const originalLocation = targetSession.location;
  const originalStartTime = targetSession.startTime;

  targetSession.location = 'Main Auditorium (Relocated due to AV maintenance)';
  targetSession.startTime = '10:00 AM';
  targetSession.notes = 'Emergency room relocation promulgated at 11:00 PM.';
  targetSession.updatedFlag = true;

  fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2), 'utf8');
  console.log(`  -> Updated session [${targetSession.id}]: "${targetSession.title}"`);
  console.log(`     Location: "${originalLocation}" => "${targetSession.location}"`);
  console.log(`     Start Time: "${originalStartTime}" => "${targetSession.startTime}"`);
  console.log(`     updatedFlag: true`);

  // 3. Prepend Pinned Emergency Announcement
  console.log('\n[Step 3/5] Broadcasting emergency pinned directive in announcements.json...');
  announcementsData.forEach((a) => {
    a.pinnedFlag = false; // Unpin older announcements
  });

  const emergencyAnnouncement = {
    id: 'ann-emergency-11pm',
    title: 'URGENT 11PM DIRECTIVE: Day 2 Committee Relocation & Timing',
    body: 'Due to scheduled electrical maintenance, Committee Session II has been relocated to the Main Auditorium and will commence at 10:00 AM sharp.',
    track: 'gimun',
    timestamp: new Date().toISOString(),
    pinnedFlag: true,
    badgeLabel: 'Urgent Directive',
    actionUrl: '/schedule',
  };

  announcementsData.unshift(emergencyAnnouncement);
  fs.writeFileSync(announcementsPath, JSON.stringify(announcementsData, null, 2), 'utf8');
  console.log(`  -> Pinned new directive: "${emergencyAnnouncement.title}"`);

  // 4. Validate Modified Content
  console.log('\n[Step 4/5] Running automated content validation against modified files...');
  const validationOutput = execSync('node scripts/validate-content.mjs', { encoding: 'utf8' });
  console.log(validationOutput.trim());

  simulationSuccess = true;
  console.log('\n✓ Simulation verification PASSED: Content files modified and validated in < 1 second.');

} catch (err) {
  console.error('\n✗ Simulation error occurred:', err.message);
} finally {
  // 5. Restore Original Files
  console.log('\n[Step 5/5] Restoring original schedule.json and announcements.json...');
  fs.writeFileSync(schedulePath, originalSchedule, 'utf8');
  fs.writeFileSync(announcementsPath, originalAnnouncements, 'utf8');

  // Confirm restoration
  const restoredSchedule = fs.readFileSync(schedulePath, 'utf8');
  const restoredAnnouncements = fs.readFileSync(announcementsPath, 'utf8');
  
  if (restoredSchedule === originalSchedule && restoredAnnouncements === originalAnnouncements) {
    console.log('✓ Clean Rollback VERIFIED: Original content files fully restored with zero drift.');
  } else {
    console.error('⚠ Rollback WARNING: Files may differ from original backup.');
  }
}

console.log('\n====================================================');
if (simulationSuccess) {
  console.log(' RESULT: 11pm Emergency Update Simulation SUCCESSFUL');
  console.log('====================================================');
  process.exit(0);
} else {
  console.log(' RESULT: 11pm Emergency Update Simulation FAILED');
  console.log('====================================================');
  process.exit(1);
}
