# Wallet Library

[![Package Version](https://img.shields.io/github/package-json/v/dashevo/wallet-lib.svg?&style=flat-square)](https://www.npmjs.org/package/@dashevo/wallet-lib)
[![Build Status](https://img.shields.io/travis/com/dashevo/wallet-lib.svg?branch=master&style=flat-square)](https://travis-ci.com/dashevo/wallet-lib)

A pure and extensible JavaScript Wallet Library for Dash

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Documentation](#documentation)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)


## Background

[Dash](https://www.dash.org) is a powerful new peer-to-peer platform for the next generation of financial technology. The decentralized nature of the Dash network allows for highly resilient Dash infrastructure, and the developer community needs reliable, open-source tools to implement Dash apps and services.

## Install

### Node

In order to use this library, you will need to add it to your project as a dependency.

Having [NodeJS](https://nodejs.org/) installed, just type in your terminal : 

```sh
npm install @dashevo/wallet-lib
```

### CDN Standalone

For browser usage, you can also directly rely on unpkg. Below, we also assume you use localforage as your persistance adapter.

```
<script src="https://unpkg.com/@dashevo/wallet-lib"></script>
<script src="https://unpkg.com/localforage"></script>
const wallet = new Wallet({adapter: localforage});
```

## Usage

In your file, where you want to execute it :

```
const { Wallet, EVENTS } = require('@dashevo/wallet-lib');

const wallet = new Wallet();
wallet.getAccount((account)=>{
    // Do something with account.

});
```

Wallet will by default connects to DAPI and use either localforage (browser based device) or a InMem adapter.  
Account will by default be on expected BIP44 path (...0/0).

### Transports:

Insight-Client has been removed from MVP and is not working since Wallet-lib v3.0.

- [DAPI-Client](https://github.com/dashevo/dapi-client)

### Adapters :

- [LocalForage](https://github.com/localForage/localForage)
- [ReactNative AsyncStorage](https://facebook.github.io/react-native/docs/asyncstorage)

## Documentation

You can see some [Examples here](/docs/usage/examples.md).

More extensive documentation is available at https://dashevo.github.io/wallet-lib along with additional [examples & snippets](https://dashevo.github.io/wallet-lib/#/usage/examples).

## Maintainers

Wallet-Lib is maintained by the [Dash Core Developers](https://www.github.com/dashevo).
We want to thank all members of the community that have submitted suggestions, issues and pull requests.

## Contributing

Feel free to dive in! [Open an issue](https://github.com/dashevo/wallet-lib/issues/new/choose) or submit PRs.

## License

[MIT](LICENSE) &copy; Dash Core Group, Inc.
