const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const {abi, evm} = require('./compile');
const admin = require('firebase-admin');
require('dotenv').config();
const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.NETWORK_URL);

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
    credential: admin.credential.cert(serviceAccount), databaseURL: 'https://dsis-7ca4c.firebaseio.com'
});
const db = admin.firestore();
const studentsRef = db.collection('students');


app.use(urlencoded({extended: true}));
app.use(json());

app.post('/signup', (req, res) => {
    const {name, schoolId, faculty, department, regYear} = req.body;
    enroll(name, schoolId, faculty, department, regYear).then(contractAddress => res.send(`Enrollment request received, address at ${contractAddress}`));
});

app.post('/add-term', (req, res) => {
    const {studentId, year, season} = req.body;
    addTerm(studentId, year, season).then(() => res.send('Add term request received'));
});

app.post('/course-overall-grade', (req, res) => {
    const {studentNo, termIndex, courseID, grade} = req.body;
    setCourseOverallGrade(studentNo, termIndex, courseID, grade).then(() => res.send('Course overall grade set!'));
});

app.post('/course-letter-grade', (req, res) => {
    const {studentNo, termIndex, courseID, letterGrade} = req.body;
    setCourseLetterGrade(studentNo, termIndex, courseID, letterGrade).then(() => res.send('Course letter grade set!'));
});

app.post('/course-eval-grade', (req, res) => {
    const {studentId, termIndex, courseID, evalIndex, evalGrade} = req.body;
    setCourseEvalGrade(studentId, termIndex, courseID, evalIndex, evalGrade).then(evalIndex => res.send(`Evaluation of ${evalIndex} eval is set letter grade set!`));
});

app.post('/add-course', (req, res) => {
    const {
        schoolId, termIndex, courseName, courseID, courseCode, instructor, credit, evalCount, evalWeights, evalNames
    } = req.body;
    addCourse(schoolId, termIndex, courseName, courseID, courseCode, instructor, credit, evalCount, evalNames, evalWeights).then(() => res.send('Add course request received'));
})

app.listen(process.env.port || 3000, () => {
    console.log('Server started on port 3000');
})


const deploy = async (name, id, faculty, department, regYear) => {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploying from account: ', accounts[0]);
    const result = await new web3.eth.Contract(abi).deploy({
        data: evm.bytecode.object, arguments: [name, id, faculty, department, regYear]
    }).send({gas: '5500000', from: accounts[0]});
    console.log('deployed to', result.options.address);
    provider.engine.stop();
    return String(result.options.address);
}

const enroll = async (name, number, faculty, department, regYear) => {
    const nameArray = name.split(' ');
    const address = await deploy(name, number, faculty, department, regYear);
    const userRef = db.collection('students').doc(number);
    await userRef.set({
        name: name, contract: address, email: nameArray[0] + '.' + nameArray[1] + '@dsis.com',
    })
    return address;
}

const setCourseOverallGrade = async (studentNo, termIndex, courseID, grade) => {
    let studentAddress;
    await studentsRef.get().then((querySnapshot) => {
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

    const contract = new web3.eth.Contract(abi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.setCourseOverallGrade(termIndex, courseID, grade).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });
}

const setCourseLetterGrade = async (studentNo, termIndex, courseID, letterGrade) => {
    let studentAddress;
    await studentsRef.get().then((querySnapshot) => {
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

    const contract = new web3.eth.Contract(abi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.setCourseLetterGrade(termIndex, courseID, letterGrade).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });
}

const setCourseEvalGrade = async (studentNo, termIndex, courseID, evalIndex, evalGrade) => {
    let studentAddress = '';
    await studentsRef.get().then((querySnapshot) => {
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

    const contract = new web3.eth.Contract(abi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.setCourseEvalGrade(termIndex, courseID, evalIndex, evalGrade).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });
    return evalIndex;
}

const addCourse = async (studentNo, termIndex, courseName, courseID, courseCode, instructor, credit, evalCount, evalWeights, evalNames) => {
    const weightsArray = evalWeights.split(" ");
    const namesArray = evalNames.split(" ");
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

    const contract = new web3.eth.Contract(abi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.addCourse(termIndex, courseName, courseID, courseCode, instructor, credit, evalCount, weightsArray, namesArray).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });
}

const addTerm = async (studentNo, year, season) => {
    let studentAddress = '';
    await studentsRef.get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (studentNo == doc.id) {
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
    await contract.methods.addTerm(year, season).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error);
        } else {
            console.log(result);
        }
    });
}

/*
const checkEvaluation = async (studentNo, termIndex, courseID) => {
    setCourseOverallGrade()
    setCourseLetterGrade()
}*/
