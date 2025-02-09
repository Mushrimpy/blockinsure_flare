import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { useWriteContract } from 'wagmi'
import { useInterval } from "usehooks-ts";


interface Policy {
  id: number;
  insurer: string;
  policyholder: string;
  isFinalized: boolean;
  isPaidOut: boolean;
  coverage: bigint;
  premium: bigint;
  maturitySecond: bigint;
  purchaseDeadline: bigint;
  deposit: bigint;
}

const CONTRACT_ADDRESS = "0xe4ee44a1703f3ed5b4aa58641a6ca0b2f4966a7c";

const BUY_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "purchasePolicy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const SETTLE_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "settle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const CONTRACT_ABI = [
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
] as const;

export const Sellers = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const client = usePublicClient();
  const { writeContract } = useWriteContract();

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async (policy: Policy) => {
    if (writeContractAsync) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          functionName: "purchasePolicy",
          abi: BUY_ABI,
          args: [BigInt(policy.id)],
          value: BigInt(policy.premium),
        });
      } catch (e: any) {
        console.error("Error purchasing policy:", e);
      }
    }
  };

  const handleSettle = async (policy: Policy) => {
    if (writeContractAsync) {
      try {
        await writeContractAsync({
          address: CONTRACT_ADDRESS,
          functionName: "settle",
          abi: SETTLE_ABI,
          args: [BigInt(policy.id)],
        });
      } catch (e: any) {
        console.error("Error settling policy:", e);
      }
    }
  };

  const POLLING_INTERVAL = 10000; // 10 seconds

  // Separate the fetchPolicies function outside useEffect
  const fetchPolicies = async () => {
    if (!client) return;

    const fetchedPolicies: Policy[] = [];

    for (let i = 1; i <= 100; i++) {
      try {
        const result = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "getPolicyStatus",
          args: [BigInt(i)]
        });

        // Type guard to ensure result has the expected shape
        if (!Array.isArray(result) || result.length < 9) {
          console.error('Unexpected result format:', result);
          continue;
        }

        const [
          insurer,
          policyholder,
          isFinalized,
          isPaidOut,
          coverage,
          premium,
          maturitySecond,
          purchaseDeadline,
          deposit
        ] = result;

        // Stop if we hit an empty policy
        if (insurer === "0x0000000000000000000000000000000000000000") {
          break;
        }

        fetchedPolicies.push({
          id: i,
          insurer,
          policyholder,
          isFinalized,
          isPaidOut,
          coverage,
          premium,
          maturitySecond,
          purchaseDeadline,
          deposit
        });
      } catch (error) {
        console.error(`Error fetching policy ${i}:`, error);
        break;
      }
    }

    setPolicies(fetchedPolicies);
    setIsLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchPolicies();
  }, [client]);

  // Polling for updates
  useInterval(() => {
    if (!isLoading) {
      fetchPolicies();
    }
  }, POLLING_INTERVAL);

  const sortedPolicies = [...policies].sort((a, b) => {
    // Helper function to get status priority
    const getStatusPriority = (policy: Policy) => {
      if (policy.isFinalized) {
        if (policy.isPaidOut) return 4; // Settled - lowest priority
        if (Number(policy.maturitySecond) <= Math.floor(Date.now() / 1000)) return 1; // Claimable - highest priority
        return 2; // Active
      }
      return 3; // Available to buy
    };

    const priorityA = getStatusPriority(a);
    const priorityB = getStatusPriority(b);

    return priorityA - priorityB;
  });

  if (isLoading) return <p>Loading policies...</p>;
  if (policies.length === 0) return <p>No policies found</p>;

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="rounded-l-lg bg-base-200">ID</th>
              <th className="bg-base-200">Insurer</th>
              <th className="bg-base-200">Coverage</th>
              <th className="bg-base-200">Premium</th>
              <th className="bg-base-200">Maturity</th>
              <th className="rounded-r-lg bg-base-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedPolicies.map((policy) => (
              <tr
                key={policy.id}
                className={`
                  border-base-200 border-2 my-2 
                  hover:bg-blue-500/10 transition-colors duration-200
                  ${policy.isFinalized && policy.isPaidOut ? 'bg-blue-50 dark:bg-blue-950/30 text-gray-500' : ''}
                `}
              >
                <td className="rounded-l-lg">{policy.id}</td>
                <td className={`font-mono ${policy.isFinalized && policy.isPaidOut ? 'text-gray-500' : ''}`}>
                  {policy.insurer.slice(0, 6)}...{policy.insurer.slice(-4)}
                </td>
                <td className={policy.isFinalized && policy.isPaidOut ? 'text-gray-500' : ''}>
                  {(Number(policy.coverage) / 1e18).toFixed(2)} FLR
                </td>
                <td className={policy.isFinalized && policy.isPaidOut ? 'text-gray-500' : ''}>
                  {(Number(policy.premium) / 1e18).toFixed(2)} FLR
                </td>
                <td className={policy.isFinalized && policy.isPaidOut ? 'text-gray-500' : ''}>
                  {new Date(Number(policy.purchaseDeadline || 0) * 1000).toLocaleDateString()}
                </td>
                <td className="rounded-r-lg pl-4">
                  {policy.isFinalized ? (
                    policy.isPaidOut ? (
                      <span className="text-gray-500">
                        Resolved
                      </span>
                    ) : (
                      Number(policy.maturitySecond) <= Math.floor(Date.now() / 1000) ? (
                        <button
                          className="btn btn-sm bg-[#e81c54]/80 hover:bg-[#e81c54] text-white border-none"
                          onClick={() => handleSettle(policy)}
                        >
                          Claim
                        </button>
                      ) : (
                        <span>
                          Active
                        </span>
                      )
                    )
                  ) : (
                    <button
                      className="btn btn-sm bg-blue-400 hover:bg-blue-500 text-white border-none"
                      onClick={() => handleWrite(policy)}
                    >
                      Buy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};