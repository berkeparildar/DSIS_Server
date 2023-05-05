const path = require('path');
const fs = require('fs');
const solc = require('solc');

const studentPath = path.resolve(__dirname, 'contracts', 'Student.sol');
const sSource = fs.readFileSync(studentPath, 'utf8');
const termPath = path.resolve(__dirname, 'contracts', 'Term.sol');
const tSource = fs.readFileSync(termPath, 'utf8');
const coursePath = path.resolve(__dirname, 'contracts', 'Course.sol');
const cSource = fs.readFileSync(coursePath, 'utf8');

let input = {
    language: "Solidity",
    sources: {
        "Student.sol": {
            content: sSource,
        },
        "Term.sol": {
            content: tSource,
        },
        "Course.sol": {
            content: cSource
        }
    },
    settings: {
        outputSelection: {
            "*": {
                "*": [ "*" ],
            }
        }
    }
};

let output = JSON.parse(solc.compile(JSON.stringify(input)));
//console.log(output.contracts['Student.sol']['Student'].evm.bytecode);
module.exports = output.contracts['Student.sol']['Student'];