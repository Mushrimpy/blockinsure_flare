"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const WaitlistPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Submitting email:", email);

    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfRLHU-vCNF2LsGkHBoK89dfvsnsRDnc8ObIqc5XnkvxnHATg/formResponse";
    
    try {
      const formData = new URLSearchParams();
      formData.append('entry.1917349095', email);
      console.log("Form data created:", formData.toString());

      const response = await fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
      console.log("Response received:", response);

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto mb-4">
            <EnvelopeIcon className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join the Waitlist</h1>
          <p className="text-base-content/80">
            Be the first to know when we launch on mainnet. Get early access to weather risk protection.
          </p>
        </div>

        {submitted ? (
          <div className="text-center p-6 bg-base-200 rounded-box">
            <h3 className="text-xl font-bold mb-2">Thank you for joining!</h3>
            <p>We&apos;ll notify you when we launch.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default WaitlistPage; 