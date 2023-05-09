const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const contracts = require('./compile');
const studentAbi = contracts.Student.abi;
const studentEvm = contracts.Student.evm.bytecode.object;
const termAbi = contracts.Term.abi;
const courseAbi = contracts.Course.abi;
const admin = require('firebase-admin');
require('dotenv').config();

const express = require('express');
const {urlencoded, json} = require("express");
const app = express();
app.use(urlencoded({extended: true}));
app.use(json());


const provider = new HDWalletProvider(process.env.MNEMONIC, process.env.NETWORK_URL);
const web3 = new Web3(provider);

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
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), databaseURL: 'https://dsis-7ca4c.firebaseio.com'
});
const db = admin.firestore();
const studentsRef = db.collection('students');

app.post('/signup', (req, res) => {
    const {name, schoolId, faculty, department, regYear} = req.body;
    enroll(name, schoolId, faculty, department, regYear).then(contractAddress => res.send(`Enrollment request received, address at ${contractAddress}`));
});

app.post('/add-term', (req, res) => {
    const {studentId, year, season} = req.body;
    addTerm(studentId, year, season).then(() => res.send('Add term request received'));
});

app.post('/course-eval-grade', (req, res) => {
    const {studentId, termIndex, courseID, evalIndex, evalGrade} = req.body;
    setCourseEvalGrade(studentId, termIndex, courseID, evalIndex, evalGrade).then( async contract =>
        await getEvalInfo(contract, termIndex, courseID)).then(msg => res.send(msg));
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
    const result = await new web3.eth.Contract(studentAbi).deploy({
        data: studentEvm, arguments: [name, id, faculty, department, regYear]
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

const setCourseOverallGrade = async (studentContract, termIndex, courseID, grade, sender) => {
    await studentContract.methods.setOverallGrade(termIndex, courseID, grade).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });
}

const setCourseLetterGrade = async (studentContract, termIndex, courseID, letterGrade, sender) => {
    await studentContract.methods.setLetterGrade(termIndex, courseID, letterGrade).send({from: sender}, (error, result) => {
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

    const contract = new web3.eth.Contract(studentAbi, studentAddress);
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    await contract.methods.setCourseEvalGrade(termIndex, courseID, evalIndex, evalGrade).send({from: sender}, (error, result) => {
        if (error) {
            console.error(error());
        } else {
            console.log(result);
        }
    });
    return contract;
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

    const contract = new web3.eth.Contract(studentAbi, studentAddress);
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
    const contract = new web3.eth.Contract(studentAbi, studentAddress);
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

function getLetterGrade(grade) {
    switch (true) {
        case (grade >= 90 && grade <= 100):
            return "AA";
        case (grade >= 85 && grade < 90):
            return "BA";
        case (grade >= 80 && grade < 85):
            return "BB";
        case (grade >= 75 && grade < 80):
            return "CB";
        case (grade >= 70 && grade < 75):
            return "CC";
        case (grade >= 65 && grade < 70):
            return "DC";
        case (grade >= 60 && grade < 65):
            return "DD";
        case (grade >= 50 && grade < 60):
            return "FD";
        default:
            return "FF";
    }
}

const getEvalInfo = async (studentContract, termIndex, courseID) => {
    console.log("started");
    const accounts = await web3.eth.getAccounts();
    await studentContract.methods.terms(termIndex).call({ from: accounts[0] }, (error, result) => {
        console.log("got term")
        if (error) {
            console.error(error);
        } else {
            const term = new web3.eth.Contract(termAbi, result);
            term.methods.getCourses().call({ from: accounts[0] }, async (error, result) => {
                if (error) {
                    console.error(error);
                } else {
                    for (let j = 0; j < result.length; j++) {
                        console.log("got courses");
                        const course = new web3.eth.Contract(courseAbi, result[j]);
                        let totalScore = 0;
                        if (parseInt(await course.methods.getCourseID().call()) === courseID){
                            console.log("got the course")
                            const evaluationCount = await course.methods.evaluationCount().call();
                            for (let i = 0; i < evaluationCount; i++) {
                                const evalCriterion = await course.methods.evaluationCriteria(i).call();
                                const evalWeight = evalCriterion.weight;
                                const evalGrade = evalCriterion.grade;
                                const evalName = evalCriterion.name;
                                console.log(evalName + ": " + evalGrade);
                                if (parseInt(evalGrade) === 101){
                                    return 'Not all grades are set!';
                                }
                                totalScore += evalGrade * (evalWeight / 100);
                            }
                            let letterGrade = getLetterGrade(totalScore);
                            await setCourseLetterGrade(studentContract, termIndex, courseID, letterGrade, accounts[0]);
                            await setCourseOverallGrade(studentContract, termIndex, courseID, totalScore, accounts[0]);
                            return 'All grades are now set!';
                        }
                    }
                }
            });
        }
    });
}