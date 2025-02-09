import { useAccount } from "wagmi"
import { Address } from "~~/components/scaffold-eth"
import { useState } from "react"
import { notification } from "~~/utils/scaffold-eth";

export const RealData = ({ text }: { text: string }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/run-script');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            console.log('Script output:', data.output);

            // Show notification
            notification.success(
                <div className="flex flex-col gap-2">
                    <p className="font-bold m-0">Oracle Data Updated!</p>
                    <p className="m-0">New rainfall data has been fetched from Flare Data Connector.</p>
                </div>,
            );

        } catch (error) {
            console.error('Error running script:', error);
            notification.error(
                <div className="flex flex-col gap-2">
                    <p className="font-bold m-0">Error Fetching Data</p>
                    <p className="m-0">Failed to update rainfall data. Please try again.</p>
                </div>
            );
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <button
            className={`btn border-none transition-all text-height duration-300 w-[29rem] h-[4rem] mx-auto my-10 px-12 py-3 text-medium text-white 
                ${isLoading ? 'bg-[#e81c54]' : 'bg-primary hover:bg-[#e81c54]'}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? 'Running... Waiting for Flare Data Connector Validators' : text}
        </button>
    );
}