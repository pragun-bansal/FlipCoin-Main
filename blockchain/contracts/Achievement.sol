//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

contract Achievement {
    string public title;
    string public desc;
    int256 public reward;

    constructor(string memory _title, string memory _desc, int256 _reward) {
        title = _title;
        desc = _desc;
        reward = _reward;
    }
}
