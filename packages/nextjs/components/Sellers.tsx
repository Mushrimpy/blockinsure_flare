// import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";
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
//   const { data: insuranceContract } = useDeployedContractInfo("YourContractName");

//   // Read all policies
//   const { data: policies } = useContractRead({
//     address: insuranceContract?.address,
//     abi: insuranceContract?.abi,
//     functionName: "getAllPolicies",
//     watch: true,
//   });

//   // Write function to purchase policy
//   const { write: purchasePolicy, data: purchaseData } = useContractWrite({
//     address: insuranceContract?.address,
//     abi: insuranceContract?.abi,
//     functionName: "purchasePolicy",
//   });

//   // Wait for transaction
//   const { isLoading: isPurchasing } = useWaitForTransaction({
//     hash: purchaseData?.hash,
//     onSuccess: () => {
//       notification.success("Successfully purchased policy!");
//     },
//   });

//   // Filter for available policies (not finalized and not expired)
//   const availablePolicies = (policies as Policy[])?.filter(
//     policy => 
//       !policy.isFinalized && 
//       Number(policy.purchaseDeadline) > Date.now() / 1000
//   ) || [];

//   const handlePurchase = (policyId: number, premium: bigint) => {
//     purchasePolicy({ args: [policyId], value: premium });
//   };

//   return (
//     <div className="flex flex-col gap-4 p-4">
//       <h2 className="text-2xl font-bold">Available Insurance Policies</h2>
      
//       <div className="overflow-x-auto">
//         <table className="table w-full">
//           <thead>
//             <tr>
//               <th>Insurer</th>
//               <th>Coverage (ETH)</th>
//               <th>Premium (ETH)</th>
//               <th>City Number</th>
//               <th>Threshold</th>
//               <th>Purchase Deadline</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {availablePolicies.map((policy, index) => (
//               <tr key={index}>
//                 <td className="font-mono">{policy.insurer.slice(0, 6)}...{policy.insurer.slice(-4)}</td>
//                 <td>{formatEther(policy.coverage)} ETH</td>
//                 <td>{formatEther(policy.premium)} ETH</td>
//                 <td>{Number(policy.cityNum)}</td>
//                 <td>{Number(policy.threshold)}</td>
//                 <td>{new Date(Number(policy.purchaseDeadline) * 1000).toLocaleDateString()}</td>
//                 <td>
//                   <button
//                     className="btn btn-primary btn-sm"
//                     onClick={() => handlePurchase(index, policy.premium)}
//                     disabled={isPurchasing || !address}
//                   >
//                     {isPurchasing ? "Buying..." : "Buy Policy"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {availablePolicies.length === 0 && (
//         <div className="text-center py-4 text-gray-500">
//           No available policies found
//         </div>
//       )}

//       {!address && (
//         <div className="text-center py-4 text-yellow-500">
//           Please connect your wallet to purchase policies
//         </div>
//       )}
//     </div>
//   );
// };
