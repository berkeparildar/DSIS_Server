// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Course.sol";
import "./Term.sol";

contract Student {
    string public name;
    string public faculty;
    string public department;
    uint public regYear; 
    uint256 id;
    Term[] public terms;

    constructor(string memory _name, uint _id, string memory _faculty, string memory _department, uint _regYear) {
        name = _name;
        id = _id;
        faculty = _faculty;
        department = _department;
        regYear = _regYear;
    }

    function getName()view public returns (string memory) {
        return name;
    }

    function getFaculty()view public returns (string memory) {
        return faculty;
    }

    function getDepartment()view public returns (string memory) {
        return department;
    }

    function getRegYear() view public returns (uint) {
        return regYear;
    }

    function getID() view public returns (uint) {
        return id;
    }

    function getTerms() view public returns (Term[] memory) {
        return terms;
    }

    function addTerm(uint _year, string memory _season) public {
        Term term = new Term(_year, _season);
        terms.push(term);
    }

    function addCourse(uint _termIndex, string memory _courseName, uint _courseID, string memory
        _courseCode, string memory _instructor, uint _credit,  uint _evalCount, string[] memory _evalNames, uint[] memory _evalWeights) public {
        terms[_termIndex].addCourse(_courseName, _courseID, _courseCode, _instructor, _credit, _evalCount, _evalNames, _evalWeights);
    }

    function setCourseOverallGrade(uint _termIndex, uint _courseID, string memory _grade) public {
        for (uint i = 0; i < terms[_termIndex].getCourses().length; i++) {
            if (terms[_termIndex].getCourses()[i].getCourseID() == _courseID) {
                terms[_termIndex].getCourses()[i].setOverallGrade(_grade);
            }
        }
    }

    function setCourseLetterGrade(uint _termIndex, uint _courseID, string memory _letterGrade) public {
        for (uint i = 0; i < terms[_termIndex].getCourses().length; i++) {  
            if (terms[_termIndex].getCourses()[i].getCourseID() == _courseID) {
                terms[_termIndex].getCourses()[i].setLetterGrade(_letterGrade);
            }
        }
    }

    function setCourseEvalGrade(uint _termIndex, uint _courseID, uint _evalIndex, uint _evalGrade) public {
        for (uint i = 0; i < terms[_termIndex].getCourses().length; i++) {  
            if (terms[_termIndex].getCourses()[i].getCourseID() == _courseID) {
                terms[_termIndex].getCourses()[i].setEvaluationGrade(_evalIndex, _evalGrade);
            }
        }
    }
}
