// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Course {
    string public name;
    uint public credit;
    uint public hour;
    string public term;
    uint public grade;
    string public courseCode;
    string public letterGrade;
    uint public courseID;

    constructor(
        string memory _name,
        uint _credit,
        uint _hour,
        string memory _term,
        string memory _code,
        uint _courseID
    ) {
        name = _name;
        credit = _credit;
        hour = _hour;
        term = _term;
        courseCode = _code;
        courseID = _courseID;
    }

    function setGrade(uint _grade) public{
        grade = _grade;
    }

    function getGrade() public view returns (uint) {
        return grade;
    }

     function getCourseID() public view returns (uint) {
        return courseID;
    }
}
