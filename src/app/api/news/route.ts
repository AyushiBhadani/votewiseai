import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || 'India';
    
    // HACKATHON OPTIMIZATION: AI disabled for news to save 100% of the quota for the Chatbot!
    return NextResponse.json([
      { 
        id: "mock-1", 
        date: new Date().toISOString().split('T')[0], 
        title: `Major Voting Reforms Proposed in ${country}`, 
        description: "New initiatives aim to increase voter turnout and ensure smoother registration processes across all major districts.", 
        source: "Global Election News" 
      },
      { 
        id: "mock-2", 
        date: new Date().toISOString().split('T')[0], 
        title: `Youth Voter Registration Surges Ahead of ${country} Elections`, 
        description: "Record numbers of young people are registering to vote, signaling high engagement for the upcoming political cycle.", 
        source: "VoteWise AI Network" 
      },
      { 
        id: "mock-3", 
        date: new Date().toISOString().split('T')[0], 
        title: "New Fact-Checking Initiative Launched", 
        description: "A coalition of independent journalists has launched a live fact-checking platform to combat misinformation during the campaigns.", 
        source: "Democracy Watch" 
      }
    ]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
