import { useAccount } from "wagmi"
import { Address } from "~~/components/scaffold-eth"
import { CloudIcon, ShieldCheckIcon, CurrencyDollarIcon, ChartBarIcon } from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import { RealData } from "./RealData"
import { Sellers } from "./Sellers";


// OLD Insurance contract address: 0xd699b916ac8a9e979d03f00cd511ab8baf00e6d6
// NEW Insurance contract address: 0xe4ee44a1703f3ed5b4aa58641a6ca0b2f4966a7c


// Fetch weather data (Replace with API call)
const fetchWeatherData = async () => {
    return {
        temperature: 24,
        humidity: 65,
        windSpeed: 12,
        rainfall: 2,
    }
}

// Blockchain and policy mock data
const mockPolicyData = {
    active: 2,
    totalCoverage: 1000,
    nextPayout: "2025-07-01",
}

const mockBlockchainData = {
    contractBalance: "5.5 FLR",
    totalPolicies: 150,
    averagePremium: "0.1 FLR",
}

export const WeatherDashboard = () => {
    const { address: connectedAddress } = useAccount()
    const [weather, setWeather] = useState<any>(null)

    useEffect(() => {
        fetchWeatherData().then(setWeather)
    }, [])

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Rainfall Insurance Dashboard </h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Connected Address:</span>
                    <Address address={connectedAddress} />
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                    title="Current Weather"
                    icon={<CloudIcon className="h-6 w-6 text-blue-500" />}
                    items={weather ? [
                        { label: "Temperature", value: `${weather.temperature}°C` },
                        { label: "Humidity", value: `${weather.humidity}%` },
                        { label: "Wind Speed", value: `${weather.windSpeed} km/h` },
                        { label: "Rainfall", value: `${weather.rainfall} mm` },
                    ] : []}
                />
                <DashboardCard
                    title="Your Policies"
                    icon={<ShieldCheckIcon className="h-6 w-6 text-green-500" />}
                    items={[
                        { label: "Active Policies", value: mockPolicyData.active.toString() },
                        { label: "Total Coverage", value: `$${mockPolicyData.totalCoverage}` },
                        { label: "Next Payout", value: mockPolicyData.nextPayout },
                    ]}
                />
                <DashboardCard
                    title="Financial Overview"
                    icon={<CurrencyDollarIcon className="h-6 w-6 text-yellow-500" />}
                    items={[
                        { label: "Contract Balance", value: mockBlockchainData.contractBalance },
                        { label: "Total Policies", value: mockBlockchainData.totalPolicies.toString() },
                        { label: "Avg. Premium", value: mockBlockchainData.averagePremium },
                    ]}
                />
                <DashboardCard
                    title="Risk Assessment"
                    icon={<ChartBarIcon className="h-6 w-6 text-red-500" />}
                    items={[
                        { label: "Current Risk", value: "Medium" },
                        { label: "Forecast", value: "Stable" },
                        { label: "Recommended Action", value: "Hold" },
                    ]}
                />
            </div>

            <RealData
                text="Use Flare FDC to get rainfall data on the blockchain"
            />
            <Sellers />

            {/* Transactions Table */}
            <div className="bg-base-200 rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr className="bg-base-300">
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Policy Purchase</td>
                                <td>0.5 FLR</td>
                                <td>2025-06-15</td>
                                <td><span className="badge bg-green-200">Confirmed</span></td>
                            </tr>
                            <tr>
                                <td>Claim Payout</td>
                                <td>1.2 FLR</td>
                                <td>2025-06-10</td>
                                <td><span className="badge bg-yellow-200">Pending</span></td>
                            </tr>
                            <tr>
                                <td>Premium Payment</td>
                                <td>0.1 FLR</td>
                                <td>2025-06-01</td>
                                <td><span className="badge bg-green-200">Confirmed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// Dashboard Card Component using DaisyUI
const DashboardCard = ({
    title,
    icon,
    items,
}: { title: string; icon: React.ReactNode; items: { label: string; value: string }[] }) => (
    <div className="card bg-base-100 shadow-md p-4">
        <div className="flex items-center mb-3">
            {icon}
            <h2 className="text-lg font-bold ml-2">{title}</h2>
        </div>
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
)