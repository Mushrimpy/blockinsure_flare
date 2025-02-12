import React from "react";
import { CodeBracketIcon } from "@heroicons/react/24/outline";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      {/* Footer content */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <div className="space-y-2">
          <p className="font-bold">FlareInsure</p>
          <a
            href="https://github.com/ssocolow/flare_insure"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            <CodeBracketIcon className="h-4 w-4" />
            View Source
          </a>
          <p>Powered by Flare Network</p>
        </div>
      </footer>
    </div>
  );
};
