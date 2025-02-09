#!/bin/bash
# Add your bash commands here
cd /home/simon/programming/hackathon/flare_insure/
source .env
echo $PRIVATE_KEY
echo "hi"
npx hardhat run scripts/FDCExampleJqFirstHalf.ts --network coston2
echo "about to sleep"
sleep 120
npx hardhat run scripts/FDCExampleJqSecondHalf.ts --network coston2
echo "Script executed successfully!"