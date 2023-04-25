const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const {abi, evm} = require('./compile');

const provider = new HDWalletProvider(
);

const web3 = new Web3(provider);

const deploy = async (name, id) => {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploying from account: ', accounts[0]);
    const result = await new web3.eth.Contract(abi).deploy({data: evm.bytecode.object, arguments: [name, id]}).send({ gas: '3000000', from: accounts[0]});
    console.log('deployed to', result.options.address);
    provider.engine.stop();
}

const enroll = async () => {
    const name = prompt('Enter student name:');
    const number = prompt('Enter student number:');
    deploy(name, number);
}