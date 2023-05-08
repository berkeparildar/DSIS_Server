// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

struct EvaluationCriterion {
        string name;
        uint weight;
        uint grade;
    }
    
contract Course {
    string public name;
    uint public courseID;
    string public courseCode;
    string public instructor;
    uint public credit;
    uint public overallGrade;
    string public letterGrade;
    uint public evaluationCount;
    EvaluationCriterion[] public evaluationCriteria;

    constructor(
        string memory _name,
        uint _courseID,
        string memory _courseCode,
        string memory _instructor,
        uint _credit,
        uint _evalCount,
        string[] memory _evalNames,
        uint[] memory _evalWeights
    ) {
        name = _name;
        courseID = _courseID;
        courseCode = _courseCode;
        instructor = _instructor;
        credit = _credit;
        evaluationCount = _evalCount;

        for (uint256 index = 0; index < evaluationCount ; index++) {
            evaluationCriteria.push(EvaluationCriterion({
                name: _evalNames[index],
                weight: _evalWeights[index],
                grade: 101
            }));
        }
    }

    function setOverallGrade(uint _overallGrade) public{
        overallGrade = _overallGrade;
    }

    function getOverallGrade() public view returns (uint) {
        return overallGrade;
    }

    function setLetterGrade(string memory _letterGrade) public{
        letterGrade = _letterGrade;
    }

    function getLetterGrade() public view returns (string memory) {
        return letterGrade;
    }

    function setEvaluationGrade(uint _index, uint _evalGrade) public{
        evaluationCriteria[_index].grade = _evalGrade;
    }

    function getCourseID() view public returns (uint) {
        return courseID;
    }
}
