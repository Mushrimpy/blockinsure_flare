# BlockInsure: Decentralized Weather Insurance Platform

BlockInsure is a decentralized weather insurance platform built on the Flare Network, leveraging blockchain technology and real-world weather data to provide transparent, automated insurance policies against rainfall-related risks.

## Overview

BlockInsure enables users to create, buy, and settle weather insurance policies in a trustless manner. The platform uses Flare Network's Data Connector (FDC) to fetch real-world rainfall data, ensuring reliable and tamper-proof policy settlements.

### Key Features

- **Create Insurance Policies**: Insurers can create customized policies by specifying:
  - Coverage amount
  - Premium cost
  - Maturity period
  - Rainfall threshold
  - City location

- **Purchase Policies**: Users can browse and purchase available policies by paying the premium

- **Automated Settlements**: Smart contracts automatically settle policies based on actual rainfall data

- **Real-time Weather Data**: Integration with Flare Data Connector for reliable weather information

## How It Works

1. **Policy Creation**
   - Insurers deposit collateral (coverage amount)
   - Set policy parameters (premium, coverage, threshold)
   - Policy becomes available in the marketplace

2. **Policy Purchase**
   - Users browse available policies
   - Purchase by paying the premium
   - Premium is transferred to the insurer

3. **Policy Settlement**
   - At maturity, smart contract checks rainfall data
   - If rainfall is below threshold: Policyholder receives payout
   - If rainfall is above threshold: Insurer receives collateral back
   - Settlement window: 1 day after maturity

4. **Data Verification**
   - Rainfall data is fetched from Flare Data Connector
   - Multiple validators ensure data accuracy
   - Completely decentralized and tamper-proof

## Technical Architecture

### Smart Contracts

1. **WeatherInsuranceMarketplace.sol**
   - Main contract handling policy lifecycle
   - Manages policy creation, purchase, and settlement
   - Interfaces with Weather Oracle

2. **Weather Oracle**
   - Interfaces with Flare Data Connector
   - Provides verified rainfall data
   - Used for policy settlement decisions

### Frontend Components

1. **Dashboard**
   - Real-time weather data
   - Policy statistics
   - Financial metrics
   - Risk assessment

2. **Policy Marketplace**
   - List of available policies
   - Policy details and status
   - Purchase and claim interfaces

## Getting Started

### Prerequisites

- Node.js v18+
- Git
- Yarn or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blockinsure.git
cd blockinsure
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

### Smart Contract Deployment

1. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

2. Deploy contracts:
```bash
yarn deploy
```

## Usage

1. **Creating a Policy**
   - Connect wallet
   - Set policy parameters
   - Deposit collateral
   - Confirm transaction

2. **Purchasing a Policy**
   - Browse available policies
   - Select desired policy
   - Pay premium
   - Receive policy token

3. **Claiming Payout**
   - Wait for policy maturity
   - Check rainfall data
   - Click "Claim" if eligible
   - Receive payout automatically

## Technical Details

### Policy States

1. **Available**: Created but not purchased
2. **Active**: Purchased but not matured
3. **Claimable**: Matured and eligible for settlement
4. **Resolved**: Settled and paid out

### Settlement Logic

```solidity
if (rainfall < policy.threshold) {
    // Pay policyholder
    recipient = policyholder;
} else {
    // Return to insurer
    recipient = insurer;
}
```

## Security

- All smart contracts are open source
- Collateral locked in smart contracts
- Decentralized oracle network
- Automated settlement process

## Future Enhancements

1. Multi-token support
2. Additional weather parameters
3. Policy bundling
4. Secondary market for policies
5. Advanced risk modeling

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flare Network team
- Scaffold-ETH community
- All contributors and testers

## Contact

For questions and support, please open an issue or contact the team at [contact@blockinsure.com](mailto:contact@blockinsure.com)



