// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

struct EvaluationCriterion {
        string name;
        uint weight;
    }
    
contract Course {
    string public name;
    uint public credit;
    uint public hour;
    uint public grade;
    string public courseCode;
    string public letterGrade;
    uint public courseID;
    uint public evaluationCount;


    constructor(
        string memory _name,
        uint _credit,
        uint _hour,
        string memory _code,
        uint _courseID,
        uint _evalCount,
        string[] memory _evalNames,
        uint[] memory _evalWeights
    ) {
        name = _name;
        credit = _credit;
        hour = _hour;
        courseCode = _code;
        courseID = _courseID;
        evaluationCount = _evalCount;

        for (uint256 index = 0; index < evaluationCount ; index++) {
            evaluationCriteria.push(EvaluationCriterion({
                name: _evalNames[index],
                weight: _evalWeights[index]
            }));
        }
    }

    

    EvaluationCriterion[] public evaluationCriteria;

    function setGrade(uint _grade) public{
        grade = _grade;
    }

    function getGrade() public view returns (uint) {
        return grade;
    }

    function getEvalCount() public view returns (uint) {
        return evaluationCount;
    }
    

    function getWeightNames() public view returns (EvaluationCriterion[] memory) {
        return evaluationCriteria;
    }

     function getCourseID() public view returns (uint) {
        return courseID;
    }
}
