const {
    makeSTXTokenTransfer,
    broadcastTransaction,
    AnchorMode,
  } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { StacksDevnetOrchestrator } = require("../dist/index.js");

const orchestrator = new StacksDevnetOrchestrator({
  path: "./clarinet-proj/Clarinet.toml",
  logs: true,
  devnet: {
    bitcoin_controller_block_time: 500,
  }
});

beforeAll(() => {
  console.log(new Date().toLocaleTimeString(), '_____BEFORE ALL___');
  return orchestrator.start()
})
afterAll(() => orchestrator.stop())

test('Block height changes when blocks are mined', async () => {
  console.log(new Date().toLocaleTimeString(), '___TEST BEGIN___');
  const network = new StacksTestnet({ url: orchestrator.getStacksNodeUrl() });

  // Let's wait for our Genesis block
  var block = orchestrator.waitForStacksBlock();
  console.log(new Date().toLocaleTimeString(), '___GOT STACKS BLOCK___');
  // Build a transaction
  const txOptions = {
    recipient: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5',
    amount: 12345,
    senderKey: '753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601',
    network,
    memo: 'test memo',
    nonce: 0, // set a nonce manually if you don't want builder to fetch from a Stacks node
    fee: 200, // set a tx fee if you don't want the builder to estimate
    anchorMode: AnchorMode.OnChainOnly
  };
  console.log(new Date().toLocaleTimeString(), '___MAKE STX TX___');
  const transaction = await makeSTXTokenTransfer(txOptions);

  console.log(new Date().toLocaleTimeString(), '___BROADCAST STX TX___');
  // Broadcast transaction to our Devnet stacks node
  await broadcastTransaction(transaction, network);
  
  console.log(new Date().toLocaleTimeString(), '___WAIT FOR NEXT STACKS BLOCK___');
  // Wait for the next block
  block = orchestrator.waitForStacksBlock();

  // Ensure that the transaction was included in the block
  console.log(new Date().toLocaleTimeString(), `Next Block: ${JSON.stringify(block)}`);
}, 12_500_000)