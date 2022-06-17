# BridgedERC20Factory

## Build

```
npm run build
```
## Test

```
npm run test
```

## Deploy

First please edit the `admin`, `payment` in `deploy/deploy.ts`

```
export MNEMONIC="test test test test test test test test test test test junk"
npx hardhat --network rei-testnet deploy
```

## Contract role for token contract

`DEFAULT_ADMIN_ROLE`: The highest role, can grant/revoke other role, can also set the capbility of minters.</br>
`MINTER_ROLE`: The mint role can mint token, but cannot exceed the capbility.</br>
`PAUSER_ROLE`: The pauser role can stop the token circulation.

## License

[MIT](./LICENSE)
