# CrownFunding Contracts

This project is a a crowdfunding campaign where users can pledge funds to and claim funds from the contract.
Elements of this project:

1. Funds take the form of a custom ERC20 token
2. Crowdfunded projects have a funding goal
3. When a funding goal is not met, customers are be able to get a refund of their pledged funds
4. dApps using the contract can observe state changes in transaction logs
5. contract is upgradeable

to run the project:

```shell
npm install
npm run node
npm run deploy
// for testing purposes all usecases are included
npm test
```
