// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Course.sol";
import "./Term.sol";

contract Student {
    string public name;
    uint256 id;
    Term[] public terms;

    constructor(string memory _name, uint256 _id) {
        name = _name;
        id = _id;
    }

    function addTerm(uint _year, string memory _season) public {
        Term term = new Term(_year, _season);
        terms.push(term); 
    }

    function addCourse(uint _index, string memory _name, uint _credit, uint _hours, string memory _term, string memory _code, uint _id) public{
        terms[_index].addCourse(_name, _credit, _hours, _term, _code, _id);
    }

  function setCourseGrade(uint _index, uint _id, uint _grade) public {
        for (uint i = 0; i < terms[_index].getCourses().length; i++) {
            if (terms[_index].getCourses()[i].getCourseID() == _id){
                terms[_index].getCourses()[i].setGrade(_grade);
            }
        }
    }
}