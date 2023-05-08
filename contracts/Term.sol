// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Course.sol";
contract Term {
    uint public year;
    string public season;
    Course[] public courses;
    constructor(uint _year, string memory _season){
        year = _year;
        season = _season;
    }

    function addCourse(string memory _courseName, uint _courseID, string memory _courseCode, string memory _instructor, uint _courseCredit, uint _evalCount, string[] memory _evalNames, uint[] memory _evalWeights) public {
        Course course = new Course(_courseName, _courseID, _courseCode, _instructor, _courseCredit, _evalCount, _evalNames, _evalWeights);
        courses.push(course); 
    }

    function getCourses () public view returns (Course[] memory){
        return courses;
    }
}
