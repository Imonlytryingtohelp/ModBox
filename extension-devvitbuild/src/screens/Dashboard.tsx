/**
 * Dashboard Screen - Mod Statistics & Activity
 */

import { Devvit, useAsync } from '@devvit/public-api';

interface StatCard {
  label: string;
  icon: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
}

const Dashboard: Devvit.BlockComponent = () => {
  // In a real implementation, these would fetch actual data from Reddit API
  const stats: StatCard[] = [
    { label: 'Modqueue Items', icon: '📋', value: 12, trend: 'down' },
    { label: 'Reports (24h)', icon: '🚩', value: 47, trend: 'up' },
    { label: 'Removals (7d)', icon: '🗑️', value: 156, trend: 'stable' },
    { label: 'Mods Online', icon: '👥', value: 3, trend: 'stable' },
  ];

  return (
    <vstack gap="medium" padding="medium" grow>
      <text weight="bold" size="large">
        Moderation Dashboard
      </text>
      <text size="small" color="#818384">
        Real-time monitoring of subreddit activity
      </text>

      {/* Statistics Grid */}
      <vstack gap="small" grow>
        {stats.map((stat, index) => (
          <vstack
            key={index}
            padding="medium"
            backgroundColor="#1A1A1B"
            cornerRadius="medium"
            gap="small"
          >
            <hstack alignment="center" gap="small" grow>
              <text size="large">{stat.icon}</text>
              <text color="#818384" grow>
                {stat.label}
              </text>
              <text weight="bold" size="xlarge">
                {stat.value}
              </text>
              {stat.trend === 'up' && <text color="#FF3636">↑</text>}
              {stat.trend === 'down' && <text color="#52CC52">↓</text>}
              {stat.trend === 'stable' && <text color="#818384">→</text>}
            </hstack>
          </vstack>
        ))}
      </vstack>

      {/* Feature Placeholder */}
      <vstack
        padding="large"
        backgroundColor="#1A1A1B"
        cornerRadius="medium"
        alignment="center"
      >
        <text color="#818384" alignment="center">
          📊 Advanced analytics coming soon:
        </text>
        <text color="#818384" alignment="center" size="small">
          • Mod action frequency
        </text>
        <text color="#818384" alignment="center" size="small">
          • Popular removal reasons
        </text>
        <text color="#818384" alignment="center" size="small">
          • User note trends
        </text>
        <text color="#818384" alignment="center" size="small">
          • Subreddit health scores
        </text>
      </vstack>
    </vstack>
  );
};

export default Dashboard;
