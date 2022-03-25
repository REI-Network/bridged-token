# BridgedERC20

## Build

```
npm run build
```

## Test

```
npm run test
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

`DEFAULT_ADMIN_ROLE`: The highest role, can grant/revoke other role, can also set the capbility of minters.
`MINTER_ROLE`: The mint role can mint token, but cannot exceed the capbility.
`PAUSER_ROLE`: The pauser role can stop the token circulation.

## License

MIT
