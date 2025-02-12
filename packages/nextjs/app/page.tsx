"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { 
  CloudIcon, 
  ShieldCheckIcon, 
  BanknotesIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/outline";
import Image from "next/image";

const LandingPage: NextPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-base-200 to-base-100">
        {/* Logo Container */}
        <div className="w-full flex justify-center py-10"> {/* Reduced padding from py-16 to py-10 */}
          <Image
            src="/assets/logo.png"
            alt="FlareInsure Logo"
            width={200}
            height={200}
            className="rounded-full"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 pb-20"> {/* Added bottom padding */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">FlareInsure</h1>
            <p className="text-xl mb-8 text-base-content/80">
              The first decentralized marketplace for rainfall insurance
            </p>
            <p className="text-lg mb-12">
              Protect your assets against rainfall risks with blockchain-powered parametric insurance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/waitlist" 
                className="btn btn-primary btn-lg"
              >
                Join Waitlist
              </Link>
              <Link 
                href="/dashboard" 
                className="btn btn-outline btn-lg"
              >
                Try Demo Network
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<CloudIcon className="w-8 h-8" />}
              title="Real-Time Data"
              description="Leveraging Flare Network's decentralized oracle for accurate rainfall data"
            />
            <FeatureCard 
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              title="Instant Coverage"
              description="Get protected immediately with automated smart contract policies"
            />
            <FeatureCard 
              icon={<BanknotesIcon className="w-8 h-8" />}
              title="Automatic Payouts"
              description="Receive compensation automatically when rainfall thresholds are met"
            />
            <FeatureCard 
              icon={<ChartBarIcon className="w-8 h-8" />}
              title="Transparent Risk"
              description="Clear terms and conditions with blockchain-verified execution"
            />
          </div>
        </div>
      </div>

      {/* Marketplace Section */}
      <div className="py-16 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Create & Sell Insurance</h2>
              <p className="text-lg mb-6">
                FlareInsure is more than just a platform to buy insurance. Create and sell your own rainfall insurance contracts, set your terms, and earn premiums.
              </p>
              <ul className="space-y-3 text-left list-none">
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
                  Set your own coverage amounts and premiums
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
                  Choose rainfall thresholds and locations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
                  Earn returns on your capital
                </li>
              </ul>
            </div>
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Example Contract</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Coverage:</span>
                    <span className="font-medium">1000 FLR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Premium:</span>
                    <span className="font-medium">50 FLR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Rainfall Threshold:</span>
                    <span className="font-medium">25mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Duration:</span>
                    <span className="font-medium">7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <div className="text-primary mb-4">
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default LandingPage;
