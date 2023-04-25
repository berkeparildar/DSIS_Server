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

    function addCourse(string memory _name, uint _credit, uint _hours, string memory _term, string memory _code, uint _id) public {
        Course course = new Course(_name, _credit, _hours, _term, _code, _id);
        courses.push(course); 
    }

    function getCourses () public view returns (Course[] memory){
        return courses;
    }
}