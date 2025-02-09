import { exec } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  return new Promise((resolve) => {
    exec('~/programming/hackathon/blockinsure_flare/scripts/your-script.sh', (error, stdout, stderr) => {
      if (error) {
        console.error("errrror:",error);
        resolve(NextResponse.json({ error: error.message }, { status: 500 }));
        return;
      }
      resolve(NextResponse.json({ output: stdout }));
    });
  });
} 