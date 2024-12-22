import FplService from '../services/fplService';

async function runTests() {
  console.log('🚀 Starting FPL API Tests\n');

  try {
    // Test 1: Bootstrap
    console.log('Testing Bootstrap Data...');
    const bootstrap = await FplService.getBootstrapData();
    console.log('✅ Bootstrap OK');
    console.log(`   Current Gameweek: ${bootstrap.gameweeks.find((e: any) => e.is_current)?.id}`);
    console.log(`   Total Players: ${bootstrap.players.length}`);
    console.log(`   Total Teams: ${bootstrap.teams.length}\n`);

    // Test 2: Manager Info
    const testManagerId = '1317910';
    console.log(`Testing Manager Info (ID: ${testManagerId})...`);
    const manager = await FplService.getManagerInfo(testManagerId);
    console.log('✅ Manager Info OK');
    console.log(`   Team Name: ${manager.info.name}`);
    console.log(`   Manager: ${manager.info.player_first_name} ${manager.info.player_last_name}`);
    console.log(`   Overall Points: ${manager.info.summary_overall_points}\n`);

    // Test 3: Team Picks
    const currentGw = bootstrap.gameweeks.find((e: any) => e.is_current)?.id;
    console.log(`Testing Team Picks (GW: ${currentGw})...`);
    const picks = await FplService.getTeamPicks(testManagerId, currentGw);
    console.log('✅ Team Picks OK');
    console.log(`   Squad Size: ${picks.picks.length}`);
    console.log(`   Captain: Player ID ${picks.picks.find((p: any) => p.is_captain)?.element}\n`);

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Tests failed:', error);
    process.exit(1);
  }
}

// Kör testerna
runTests(); 