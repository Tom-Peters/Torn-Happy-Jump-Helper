'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const s=fs.readFileSync(require('node:path').join(__dirname,'../Torn-Happy-Jump-Helper.user.js'),'utf8');const {achievementProgress,achievementPlan}=vm.runInNewContext(s.slice(s.indexOf('function achievementProgress'),s.indexOf('let achievementSnapshot'))+';({achievementProgress,achievementPlan})');
test('wiki wording and actual legacy counters match',()=>{for(const [d,k] of [['Travel to England 50 times','lontravel'],['Travel to Dubai 50 times','dubtravel'],['Travel to South Africa 50 times','soutravel'],['Find 50 items in the city','cityfinds'],['Import 50 items from abroad','itemsboughtabroad'],['50 job points used','jobpointsused'],['Code 50 viruses','virusescoded']])assert.equal(achievementProgress(d,{[k]:49}).remaining,1);});
test('reached counter is not automatically an earned award',()=>{const p=achievementProgress('Win 50 attacks',{attackswon:51});assert.equal(achievementPlan(p,{},Date.now(),null).days,null);});

const provider=vm.runInNewContext(s.slice(s.indexOf('function achievementProgress'),s.indexOf('let achievementSnapshot'))+';({achievementCounters,awardEducation,educationAwardProgress})');
test('grouped Torn stats resolve to real history identifiers and preserve missing and zero readings',()=>{
  const counts=provider.achievementCounters({travel:{united_kingdom:45,united_arab_emirates:0},attacking:{attacks:{won:90}},battle_stats:{strength:950},items:{found:{city:12}},crimes:{offenses:{total:100}}});
  assert.equal(achievementProgress('Travel to England 50 times',counts).counter,'uktravel');
  assert.equal(achievementProgress('Travel to Dubai 50 times',counts).remaining,50);
  assert.equal(achievementProgress('Travel to South Africa 50 times',counts),null);
  assert.equal(achievementProgress('Gain 1,000 Strength',counts).remaining,50);
  assert.equal(achievementProgress('Win 100 attacks',counts).remaining,10);
  assert.equal(provider.achievementCounters({attacking:{}}),null);
  assert.equal(provider.achievementCounters({attackswon:25}).attackswon,25);
});
test('an enrolled final course has a scheduled finish only for awards it advances',()=>{
  const now=1700000000000,until=now/1000+300000;
  const catalog={education:[{courses:[{id:2},{id:3,rewards:{honor:22}}]},{courses:[{id:4,rewards:{honor:33}}]}]};
  const education=provider.awardEducation({education:{complete:[2,2],current:{id:3,until}}},catalog);
  const degree=provider.educationAwardProgress({id:22,description:'Complete all Biology courses'},education);
  assert.equal(degree.remaining,1);assert.equal(degree.current,1);
  assert.equal(achievementPlan(degree,{},now,null).eta,until*1000);
  assert.equal(achievementPlan(degree,{},now,null).days,null);
  assert.equal(provider.educationAwardProgress({id:33,description:'Complete all Other courses'},education).courseEnd,null);
  assert.equal(provider.educationAwardProgress({id:44,description:'Complete 2 education courses'},education).courseEnd,until*1000);
  assert.equal(provider.educationAwardProgress({id:55,description:'Complete all Unlisted courses'},education),null);
  assert.equal(provider.awardEducation({},catalog),null);
});
