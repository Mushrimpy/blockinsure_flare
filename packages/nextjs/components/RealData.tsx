import { useAccount } from "wagmi"
import { Address } from "~~/components/scaffold-eth"
import { useState } from "react"

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
        } catch (error) {
            console.error('Error running script:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button 
            className="btn btn-primary" 
            onClick={handleClick}
            disabled={isLoading}
        >
            {isLoading ? 'Running... Waiting for Flare Data Connector Validators' : text}
        </button>        
    )
}