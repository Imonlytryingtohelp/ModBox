/**
 * DevBox - ModBox Companion Devvit App
 * Main Entry Point
 */

import { Devvit, useAsync, useState, useSubredditName } from '@devvit/public-api';
import ConfigEditor from './screens/ConfigEditor.js';
import Dashboard from './screens/Dashboard.js';
import Settings from './screens/Settings.js';

Devvit.configure({
  redditAPI: true,
  moderation: {
    actionsOnSubreddit: ['posts', 'comments'],
  },
});

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

const MainMenu: Devvit.BlockComponent = () => {
  const subreddit = useSubredditName();
  const [activeTab, setActiveTab] = useState<string>('editor');

  const menuItems: MenuItem[] = [
    { id: 'editor', label: 'Config Editor', icon: '⚙️' },
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '🔧' },
  ];

  return (
    <vstack gap="medium" padding="medium" backgroundColor="#030303">
      {/* Header */}
      <vstack gap="small">
        <text size="xlarge" weight="bold" color="#818384">
          DevBox - ModBox Config Manager
        </text>
        <text size="small" color="#818384">
          Managing r/{subreddit}
        </text>
      </vstack>

      {/* Navigation Tabs */}
      <hstack gap="small" grow>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onPress={() => setActiveTab(item.id)}
            appearance={activeTab === item.id ? 'primary' : 'secondary'}
            style={{
              width: '100%',
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </hstack>

      {/* Tab Content */}
      <vstack grow>
        {activeTab === 'editor' && <ConfigEditor />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'settings' && <Settings />}
      </vstack>

      {/* Footer */}
      <text size="xsmall" color="#565758" alignment="center">
        DevBox v1.0 - Companion for ModBox Extension
      </text>
    </vstack>
  );
};

Devvit.addCustomPostType({
  name: 'DevBox Manager',
  height: 'tall',
  render: (_context) => <MainMenu />,
});

export default Devvit;
