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

const CONTRACT_ADDRESS = "0xd699b916ac8a9e979d03f00cd511ab8baf00e6d6";

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

  const POLLING_INTERVAL = 10000; // 10 seconds

  // Separate the fetchPolicies function outside useEffect
  const fetchPolicies = async () => {
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
    // Sort by isFinalized (available first)
    if (a.isFinalized !== b.isFinalized) {
      return a.isFinalized ? 1 : -1;
    }
    return 0;
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
              <th className="bg-base-200">Coverage (ETH)</th>
              <th className="bg-base-200">Premium (ETH)</th>
              <th className="bg-base-200">Deadline</th>
              <th className="rounded-r-lg bg-base-200">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedPolicies.map((policy) => {
              
              return (
                <tr 
                  key={policy.id} 
                  className={`hover border-base-200 border-2 my-2 ${
                    policy.isFinalized 
                      ? 'bg-blue-50 dark:bg-blue-950/30' 
                      : ''
                  }`}
                >
                  <td className="rounded-l-lg">{policy.id}</td>
                  <td className="font-mono">
                    {policy.insurer.slice(0, 6)}...{policy.insurer.slice(-4)}
                  </td>
                  <td>{policy.coverage?.toString() || '0'}</td>
                  <td>{policy.premium?.toString() || '0'}</td>
                  <td>{new Date(Number(policy.purchaseDeadline || 0) * 1000).toLocaleDateString()}</td>
                  <td className="rounded-r-lg">
                    {policy.isFinalized ? (
                      <span className="btn btn-sm btn-ghost opacity-60">
                        Sold
                      </span>
                    ) : (
                      <button className="btn btn-primary btn-sm"
                        onClick={() => handleWrite(policy)}
                      >
                        Buy
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};