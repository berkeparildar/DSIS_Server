const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const {abi, evm} = require('./compile');
const admin = require('firebase-admin');
require('dotenv').config();
const provider = new HDWalletProvider(process.env.MNEMONIC,process.env.NETWORK_URL);

const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
};


const express = require('express');
const {urlencoded, json} = require("express");
const app = express();
const web3 = new Web3(provider);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://dsis-7ca4c.firebaseio.com'
});
const db = admin.firestore();
const studentsRef = db.collection('students');


app.use(urlencoded({ extended: true}));
app.use(json());

app.post('/signup', (req, res) => {
    const { name, schoolId } = req.body;
    enroll(name, schoolId).then( contractAddress => res.send(`Enrollment request received, address at ${contractAddress}`));
});

app.post('/edit', (req, res) => {
    const {id, name} = req.body;
    edit(id, name).then(() => res.send('Edit request received'));
});

app.post('/add', (req, res) => {
    const { studentNo, number, name, credit, hours, code, id, evalCount, weights, names } = req.body;
    add(studentNo, number, name, credit, hours, code, id, evalCount, weights, names).then(() => res.send('Add request received'));
})

app.listen(process.env.port || 3000, () => {
    console.log('Server started on port 3000');
})


const deploy = async (name, id) => {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploying from account: ', accounts[0]);
    const result = await new web3.eth.Contract(abi).deploy({
        data: evm.bytecode.object,
        arguments: [name, id]
    }).send({gas: '4500000', from: accounts[0]});
    console.log('deployed to', result.options.address);
    provider.engine.stop();
    return String(result.options.address);
}

const enroll = async (name, number) => {
    const nameArray = name.split(' ');
    const address = await deploy(name, number);
    console.log(address, typeof (address))
    const userRef = db.collection('students').doc(number);
    await userRef.set({
        name: name,
        contract: address,
        email: nameArray[0] + nameArray[1] + '@dsis.com',
    })
    return address;
}

const add = async (studentNo, number, name, credit, hours, code, id, evalCount, weights, names) => {
    const weightsArray = weights.split(" ");
    const namesArray = names.split(" ");
    let studentAddress;
    await studentsRef.get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (studentNo === doc.id) {
                    console.log(`${doc.id} => ${doc.data().contract}`);
                    studentAddress = doc.data().contract;
                    console.log(studentAddress);
                }
            });
        })
        .catch((error) => {
            console.log(`Error getting documents: ${error}`);
        });
    console.log(studentAddress);

    const contract = new web3.eth.Contract(abi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.addCourse(number, name, credit, hours, code, id, evalCount, weightsArray, namesArray).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });

    await contract.methods.getCount().call((error, result) => {
        if (error) {
            console.error(error);
        } else {
            console.log(result);
        }
    });
}

const edit = async (studentNo) => {
    let studentAddress = '';
    await studentsRef.get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (studentNo === doc.id) {
                    console.log(`${doc.id} => ${doc.data().contract}`);
                    studentAddress = doc.data().contract;
                    console.log(studentAddress);
                }
            });
        })
        .catch((error) => {
            console.log(`Error getting documents: ${error}`);
        });
    console.log(studentAddress);
    var contract = new web3.eth.Contract(abi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];
    await contract.methods.addTerm(2001, 'fall').send({from: sender}, (error, result) => {
        if (error) {
            console.error(error);
        } else {
            console.log(result);
        }
    });
}