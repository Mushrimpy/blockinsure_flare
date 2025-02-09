# FlareInsure: Decentralized Weather Insurance Platform

## Overview

FlareInsure is a decentralized weather insurance platform built on the Flare Network, leveraging blockchain technology and real-world weather data to provide transparent, automated insurance policies against rainfall-related risks.
This repository consists of the web app frontend consuming the smart contracts deployed on the Flare Network.
Backend logic repo: https://github.com/ssocolow/flare_insure

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
git clone https://github.com/Mushrimpy/blockinsure_flare.git
cd blockinsure_flare
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Special thanks to Phillip and the rest of the Flare team for helping us get set up and guiding our build! Also thanks to Adam Spiers from Toucan for the invaluable mentorship he provided.

## Contact

For questions and support, please open an issue or contact the team at [contact@flareinsure.com](mailto:simon.socolow@exeter.ox.ac.uk)



