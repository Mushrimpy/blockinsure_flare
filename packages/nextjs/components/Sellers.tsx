// import { useAccount, useReadContract, useWriteContract, useWaitForTransaction } from "wagmi";
// import { formatEther } from "viem";
// import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
// import { notification } from "~~/utils/scaffold-eth";
import { useReadContract } from 'wagmi'

function getPolicy(num : number) {
    return useReadContract({
        address: "0xd699b916ac8a9e979d03f00cd511ab8baf00e6d6",
        abi: [
            {
                name: "getPolicyStatus",
                type: "function",
                stateMutability: "view",
                inputs: [{
                    internalType: "uint256",
                    name: "_policyId",
                    type: "uint256",
                  }],
                outputs: [{
                    internalType: "address",
                    name: "_insurer",
                    type: "address",
                  },
                  {
                    internalType: "address",
                    name: "_policyholder",
                    type: "address",
                  },
                  {
                    internalType: "bool",
                    name: "_isFinalized",
                    type: "bool",
                  },
                  {
                    internalType: "bool",
                    name: "_isPaidOut",
                    type: "bool",
                  },
                  {
                    internalType: "uint256",
                    name: "_coverage",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "_premium",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "_maturitySecond",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "_purchaseDeadline",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "_deposit",
                    type: "uint256",
                  }], // Adjust based on actual return type
            },
        ],
        functionName: "getPolicyStatus",
        args: [num],
    });
}

export const Sellers = () => {
    const { data, isLoading, isError, error } = getPolicy(1);

    console.log("Data:", data);
    console.log("Loading:", isLoading);
    console.log("Error:", isError, error);

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error: {error?.message || "Unknown error"}</p>;

    return (
        <div>
            <h2>Policy Status</h2>
            <p>{data ? data.toString() : "No data available"}</p>
        </div>
    );
};
// import { useAccount, useContractRead, useContractWrite } from "wagmi";
// import { formatEther } from "viem";
// import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
// import { notification } from "~~/utils/scaffold-eth";

// interface Policy {
//   insurer: string;
//   policyholder: string;
//   maturitySecond: bigint;
//   purchaseDeadline: bigint;
//   isFinalized: boolean;
//   isPaidOut: boolean;
//   coverage: bigint;
//   premium: bigint;
//   cityNum: bigint;
//   threshold: bigint;
//   deposit: bigint;
// }

// export const Sellers = () => {
//   const { address } = useAccount();
//   const { data: insuranceContract } = useDeployedContractInfo("WeatherInsuranceMarketplace");

//   // Read all policies
//   const { data: policies, isLoading: isPoliciesLoading, error: policiesError } = useContractRead({
//     address: insuranceContract?.address,
//     abi: insuranceContract?.abi,
//     functionName: "getAllPolicies",
//     watch: true,
//     enabled: !!insuranceContract,
//   });

//   // Write function to purchase policy
//   const { writeContract: purchasePolicy, isPending } = useContractWrite({
//     abi: insuranceContract?.abi,
//     address: insuranceContract?.address,
//     functionName: "purchasePolicy",
//   });

//   // Filter for available policies (not finalized and not expired)
//   const availablePolicies = (policies as Policy[])?.filter(
//     policy =>
//       !policy.isFinalized &&
//       Number(policy.purchaseDeadline) > Date.now() / 1000 &&
//       policy.insurer !== address
//   ) || [];

//   const handlePurchase = (policyId: number, premium: bigint) => {
//     if (insuranceContract?.address) {
//       try {
//         purchasePolicy({
//           args: [BigInt(policyId)],
//           value: premium,
//         });
//         notification.success("Transaction submitted!");
//       } catch (error) {
//         notification.error("Failed to purchase policy");
//         console.error(error);
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col gap-4 p-4">
//       <h2 className="text-2xl font-bold">Weather Insurance Marketplace</h2>

//       {!insuranceContract && (
//         <div className="text-center py-4 text-yellow-500">
//           Insurance contract not deployed on this network
//         </div>
//       )}

//       {policiesError && (
//         <div className="text-center py-4 text-red-500">
//           Error loading policies: {policiesError.message}
//         </div>
//       )}

//       {isPoliciesLoading ? (
//         <div className="text-center py-4">Loading available policies...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="table w-full">
//             <thead>
//               <tr>
//                 <th>Provider</th>
//                 <th>Max Payout</th>
//                 <th>Cost</th>
//                 <th>Location</th>
//                 <th>Rain Threshold</th>
//                 <th>Valid Until</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {availablePolicies.map((policy, index) => (
//                 <tr key={index}>
//                   <td className="font-mono">{policy.insurer.slice(0, 6)}...{policy.insurer.slice(-4)}</td>
//                   <td>{formatEther(policy.coverage)} FLR</td>
//                   <td>{formatEther(policy.premium)} FLR</td>
//                   <td>City {Number(policy.cityNum)}</td>
//                   <td>{Number(policy.threshold)} mm</td>
//                   <td>{new Date(Number(policy.purchaseDeadline) * 1000).toLocaleString()}</td>
//                   <td>
//                     <button
//                       className="btn btn-primary btn-sm"
//                       onClick={() => handlePurchase(index, policy.premium)}
//                       disabled={isPending || !address}
//                     >
//                       {isPending ? "Processing..." : "Purchase"}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {availablePolicies.length === 0 && (
//         <div className="text-center py-4 text-gray-500">
//           No insurance policies available at the moment
//         </div>
//       )}

//       {!address && (
//         <div className="text-center py-4 text-yellow-500">
//           Please connect your wallet to purchase insurance
//         </div>
//       )}
//     </div>
//   );
// };
