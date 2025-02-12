import { useAccount, usePublicClient } from "wagmi"
import { Address } from "~~/components/scaffold-eth"
import { CloudIcon, ShieldCheckIcon, CurrencyDollarIcon, ChartBarIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import { RealData } from "./RealData"
import { Sellers } from "./Sellers";
import { formatEther } from "viem";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import Image from "next/image";


const CONTRACT_ADDRESS = "0xe4ee44a1703f3ed5b4aa58641a6ca0b2f4966a7c";

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
        }],
    },
] as const;

// Fetch weather data (Replace with API call)
const fetchWeatherData = async () => {
    return {
        temperature: 24,
        humidity: 65,
        windSpeed: 12,
        rainfall: 2,
    }
}

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

export const WeatherDashboard = () => {
    const { address: connectedAddress } = useAccount()
    const [weather, setWeather] = useState<any>(null)
    const [policies, setPolicies] = useState<Policy[]>([])
    const client = usePublicClient()
    const [showInstructions, setShowInstructions] = useState(() => {
        // Check if this is the first visit
        if (typeof window !== 'undefined') {
            const hasVisited = localStorage.getItem('hasVisitedDashboard');
            if (!hasVisited) {
                localStorage.setItem('hasVisitedDashboard', 'true');
                return true;
            }
        }
        return false;
    });

    // Get recent transactions
    const { data: policyCreatedEvents } = useScaffoldEventHistory({
        contractName: "WeatherInsuranceMarketplace",
        eventName: "PolicyCreated",
        fromBlock: BigInt(0),
        watch: true,
        receiptData: true,
    });

    const { data: policyPurchasedEvents } = useScaffoldEventHistory({
        contractName: "WeatherInsuranceMarketplace",
        eventName: "PolicyPurchased",
        fromBlock: BigInt(0),
        watch: true,
        receiptData: true,
    });

    const { data: policySettledEvents } = useScaffoldEventHistory({
        contractName: "WeatherInsuranceMarketplace",
        eventName: "PolicySettled",
        fromBlock: BigInt(0),
        watch: true,
        receiptData: true,
    });

    // Fetch policies
    const fetchPolicies = async () => {
        const fetchedPolicies: Policy[] = [];

        for (let i = 1; i <= 100; i++) {
            try {
                const result = await client?.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: "getPolicyStatus",
                    args: [BigInt(i)]
                });

                if (!result || !Array.isArray(result) || result.length < 9) {
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
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchWeatherData().then(setWeather);
        if (client) {
            fetchPolicies();
        }
    }, [client]);

    // Helper function for scientific notation
    const toScientific = (num: number | string) => {
        const n = Number(num);
        if (isNaN(n)) return "N/A";
        return n.toPrecision(2);
    }

    // Calculate analytics
    const userPolicies = policies.filter(p =>
        p.isFinalized && p.policyholder.toLowerCase() === connectedAddress?.toLowerCase()
    )

    // Matured = finalized, not paid out
    const userMaturedPolicies = userPolicies.filter(p =>
        !p.isPaidOut
    )

    // Active = finalized, not paid out, matured
    const userActivePolicies = userPolicies.filter(p =>
        !p.isPaidOut && Number(p.maturitySecond) <= Math.floor(Date.now() / 1000)
    )

    // Calculate financial metrics
    const activePolicies = policies.filter(p => p.isFinalized && !p.isPaidOut)

    // Get today's start and end timestamps
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000
    const endOfDay = startOfDay + 24 * 60 * 60

    // Count policies resolved today
    const dailyResolvedPolicies = policies.filter(p =>
        p.isFinalized &&
        p.isPaidOut &&
        Number(p.maturitySecond) >= startOfDay &&
        Number(p.maturitySecond) < endOfDay
    )

    const avgPremium = activePolicies.length > 0
        ? toScientific(formatEther(activePolicies.reduce((acc, p) => acc + p.premium, BigInt(0)) / BigInt(activePolicies.length)))
        : "0"
    const totalCoverage = activePolicies.reduce((acc, p) => acc + p.coverage, BigInt(0))
    const nextPayout = userActivePolicies.length > 0
        ? new Date(Math.min(...userActivePolicies.map(p => Number(p.maturitySecond))) * 1000).toLocaleDateString()
        : "No active policies"

    // Get all transactions in chronological order
    const allTransactions = [
        ...(policyCreatedEvents || []).map(e => ({
            type: "Policy Created",
            amount: toScientific(formatEther(e.args.coverage || 0n)),
            date: new Date().toLocaleDateString(),
            status: "Confirmed"
        })),
        ...(policyPurchasedEvents || []).map(e => ({
            type: "Policy Purchased",
            amount: "N/A",
            date: new Date().toLocaleDateString(),
            status: "Confirmed"
        })),
        ...(policySettledEvents || []).map(e => ({
            type: "Policy Settled",
            amount: toScientific(formatEther(e.args.amount || 0n)),
            date: new Date().toLocaleDateString(),
            status: "Confirmed"
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5) // Get last 5 transactions

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-6 py-10">
            {/* Header with How It Works Button */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowInstructions(true)}
                    className="btn btn-md gap-2 bg-[#e81c54]/80 hover:bg-[#e81c54] text-white border-none"
                >
                    <QuestionMarkCircleIcon className="h-6 w-6" />
                    How It Works
                </button>
                <div className="flex items-center space-x-2">
                    <span className="text-sm dark:text-white/70">Connected Address:</span>
                    <Address address={connectedAddress} />
                </div>
            </div>

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 dark:bg-base-200 rounded-box max-w-2xl w-full relative">
                        <button 
                            onClick={() => setShowInstructions(false)}
                            className="btn btn-sm btn-circle absolute right-2 top-2"
                        >
                            ✕
                        </button>
                        
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 dark:text-white">How It Works</h2>
                            <p className="text-base-content/70 dark:text-white/70 mb-6">Follow these steps to get started with the demo network:</p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        1
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Connect Your Wallet</h3>
                                        <p className="text-base-content/70 dark:text-white/70">
                                            Click the &quot;Connect Wallet&quot; button in the top right corner to connect your MetaMask or other Web3 wallet
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        2
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Get Test Tokens</h3>
                                        <p className="text-base-content/70 dark:text-white/70">
                                            Visit the{" "}
                                            <a 
                                                href="https://faucet.flare.network/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                Flare Faucet
                                            </a>
                                            {" "}to receive 100 CFLR (Coston testnet tokens). You can request tokens once every 24 hours.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        3
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Create or Buy Contracts</h3>
                                        <p className="text-base-content/70 dark:text-white/70">
                                            Use your test tokens to either create new insurance contracts (click &quot;Sell Insurance&quot; in the menu) or purchase existing contracts from the list below
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={() => setShowInstructions(false)}
                                    className="btn btn-primary"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                    title="Current Weather"
                    icon={<CloudIcon className="h-6 w-6 text-blue-500" />}
                    items={weather ? [
                        { label: "Temperature", value: `${toScientific(weather.temperature)}°C` },
                        { label: "Humidity", value: `${toScientific(weather.humidity)}%` },
                        { label: "Rainfall", value: `${toScientific(weather.rainfall)} mm` },
                    ] : []}
                />
                <DashboardCard
                    title="Your Policies"
                    icon={<ShieldCheckIcon className="h-6 w-6 text-blue-500" />}
                    items={[
                        { label: "Matured Policies", value: userMaturedPolicies.length.toString() },
                        { label: "Active Policies", value: userActivePolicies.length.toString() },
                        { label: "Next Payout", value: nextPayout },
                    ]}
                />
                <DashboardCard
                    title="Financial Overview"
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-blue-500" />}
                    items={[
                        { label: "Total Coverage", value: `${toScientific(formatEther(totalCoverage))} FLR` },
                        { label: "Avg. Premium", value: `${avgPremium} FLR` },
                        { label: "Daily Resolved", value: dailyResolvedPolicies.length.toString() },
                    ]}
                />
                <DashboardCard
                    title="Risk Assessment"
                    icon={<ChartBarIcon className="h-6 w-6 text-blue-500" />}
                    items={[
                        { label: "Current Risk", value: "Medium" },
                        { label: "Forecast", value: "Stable" },
                        { label: "Recommended Action", value: "Hold" },
                    ]}
                />
            </div>

            <RealData
                text="Update Rainfall Data with Flare Data Connector"
            />
            <Sellers />
        </div>
    )
}

// Dashboard Card Component using DaisyUI
const DashboardCard = ({
    title,
    icon,
    items,
}: { title: string; icon: React.ReactNode; items: { label: string; value: string }[] }) => (
    <div className="card bg-base-100 dark:bg-base-200 shadow-xl">
        <div className="card-body">
            <div className="flex items-center mb-3">
                {icon}
                <h2 className="text-lg font-bold ml-2 dark:text-white">{title}</h2>
            </div>
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                        <span className="text-base-content/70 dark:text-white/70">{item.label}</span>
                        <span className="font-medium dark:text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
)