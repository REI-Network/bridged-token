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

First please edit the `admin`, `payment` in `deploy/deployFactory.ts`

```
export MNEMONIC="test test test test test test test test test test test junk"
npx hardhat --network rei-testnet deploy
```

# BridgedERC20

## Build

```
npm run build
```

## Test

```
npm run test
```

## Deploy

First please edit the `name`, `symbol` and `decimals` in `deploy/deploy.ts`

```
export MNEMONIC="test test test test test test test test test test test junk"
npx hardhat --network rei-testnet deploy
```

## Usage

```ts
import { ethers } from "ethers";
import { BridgedERC20__factory } from "@rei-network/bridged-token";

(async () => {
  const token = BridgedERC20__factory.connect(
    "0x0efe0da2b918412f1009337FE86321d88De091fb",
    ethers.getDefaultProvider("https://rpc-testnet.rei.network")
  );

  const name = await token.name();
  const symbol = await token.symbol();
})();
```

## Contract role

`DEFAULT_ADMIN_ROLE`: The highest role, can grant/revoke other role, can also set the capbility of minters.</br>
`MINTER_ROLE`: The mint role can mint token, but cannot exceed the capbility.</br>
`PAUSER_ROLE`: The pauser role can stop the token circulation.

## License

[MIT](./LICENSE)
