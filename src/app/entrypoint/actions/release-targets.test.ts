import {processMessage} from './message.action';

const message = (content: string) => processMessage({content,channel:'C1',threadId:'1',messageId:'1'});
const original = process.env.SLACK_RELEASE_TARGETS_JSON;
beforeEach(()=>{process.env.SLACK_RELEASE_TARGETS_JSON=JSON.stringify({'user-service':['staging'],'payfusion-client-dashboard':['micheal'],'payfonte-e2e':['staging']});});
afterAll(()=>{if(original===undefined) delete process.env.SLACK_RELEASE_TARGETS_JSON; else process.env.SLACK_RELEASE_TARGETS_JSON=original;});
it('accepts a registered frontend slot and preserves slashes in internal branch names',async()=>{
  expect((await message('deploy payfusion-client-dashboard micheal feature/new-login')).data).toEqual({service:'payfusion-client-dashboard',env:'micheal',branch:'feature/new-login'});
});
it('rejects unknown targets, uncommissioned production and prefix matches', async()=>{
  for(const cmd of ['deploy user-service stagin master','deploy user-service micheal master','deploy user-service production main','deployment user-service staging main','deploy user-service staging main extra'])
    expect((await message(cmd)).error).toBeTruthy();
});
it('preserves the existing smoke default branch',async()=>{
  expect((await message('smoke staging')).data).toEqual({service:'payfonte-e2e',env:'staging',branch:'master'});
});

it('rejects traversal and ambiguous refs before release dispatch',async()=>{
  for(const ref of ['../main','a//b','feature/.hidden','a.lock','main?test','-option']){
    expect((await message('deploy user-service staging '+ref)).statusCode).toBe(422);
  }
});
