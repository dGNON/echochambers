'use client';

import { useEffect, useState } from 'react';
import { fetchAgents } from '@/server/actions';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';

interface Tweet {
  tweetUrl: string;
  tweetAuthorDisplayName: string;
  smartEngagementPoints: number;
  impressionsCount: number;
}

interface Contract {
  chain: number;
  contractAddress: string;
}

interface Agent {
  agentName: string;
  contracts: Contract[];
  twitterUsernames: string[];
  mindshare: number;
  marketCap: number;
  price: number;
  volume24Hours: number;
  holdersCount: number;
  followersCount: number;
  smartFollowersCount: number;
  topTweets: Tweet[];
  mindshareDeltaPercent: number;
  marketCapDeltaPercent: number;
  priceDeltaPercent: number;
  volume24HoursDeltaPercent: number;
  holdersCountDeltaPercent: number;
  averageImpressionsCount: number;
  averageImpressionsCountDeltaPercent: number;
  averageEngagementsCount: number;
  averageEngagementsCountDeltaPercent: number;
}

interface ApiResponse {
  ok: {
    data: Agent[];
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

function DeltaIndicator({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center ml-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export default function AgentStats() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await fetchAgents(currentPage);
        setAgents(data.ok.data);
        setTotalPages(data.ok.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, [currentPage]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="space-y-6">
        {agents.map((agent) => (
          <div key={agent.agentName} className="border rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">{agent.agentName}</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div>
                  <span>Mindshare: {agent.mindshare.toFixed(2)}</span>
                  <DeltaIndicator value={agent.mindshareDeltaPercent} />
                </div>
                
                <div>
                  <span>Market Cap: ${(agent.marketCap / 1000000).toFixed(2)}M</span>
                  <DeltaIndicator value={agent.marketCapDeltaPercent} />
                </div>
                
                <div>
                  <span>Price: ${agent.price.toFixed(4)}</span>
                  <DeltaIndicator value={agent.priceDeltaPercent} />
                </div>
                
                <div>
                  <span>24h Volume: ${(agent.volume24Hours / 1000000).toFixed(2)}M</span>
                  <DeltaIndicator value={agent.volume24HoursDeltaPercent} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span>Holders: {agent.holdersCount.toLocaleString()}</span>
                  <DeltaIndicator value={agent.holdersCountDeltaPercent} />
                </div>
                
                <div>
                  <span>Followers: {agent.followersCount.toLocaleString()}</span>
                </div>
                
                <div>
                  <span>Smart Followers: {agent.smartFollowersCount.toLocaleString()}</span>
                </div>
                
                <div>
                  <span>Avg Impressions: {agent.averageImpressionsCount.toLocaleString()}</span>
                  <DeltaIndicator value={agent.averageImpressionsCountDeltaPercent} />
                </div>
                
                <div>
                  <span>Avg Engagements: {agent.averageEngagementsCount.toFixed(1)}</span>
                  <DeltaIndicator value={agent.averageEngagementsCountDeltaPercent} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Top Tweets</h3>
              <div className="space-y-2">
                {agent.topTweets.slice(0, 3).map((tweet, index) => (
                  <div key={index} className="text-sm">
                    <a href={tweet.tweetUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-500 hover:underline">
                      {tweet.tweetAuthorDisplayName}
                    </a>
                    <span className="ml-2">
                      ({tweet.smartEngagementPoints} points, {tweet.impressionsCount.toLocaleString()} impressions)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          Previous
        </button>
        
        <span>Page {currentPage} of {totalPages}</span>
        
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}