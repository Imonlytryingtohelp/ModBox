/**
 * Settings Screen - DevBox Configuration
 */

import { Devvit, useState } from '@devvit/public-api';

const Settings: Devvit.BlockComponent = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoNotify, setAutoNotify] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSaveSettings = () => {
    setStatusMessage('✅ Settings saved');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  return (
    <vstack gap="medium" padding="medium" grow>
      <text weight="bold" size="large">
        DevBox Settings
      </text>

      {/* Webhook Configuration */}
      <vstack gap="small" padding="medium" backgroundColor="#1A1A1B" cornerRadius="medium">
        <text weight="bold">ModBox Webhook URL</text>
        <text size="small" color="#818384">
          Webhook endpoint where config change notifications are sent.
          Leave empty to disable notifications.
        </text>
        <hstack gap="small">
          <text size="small" color="#818384">🔗</text>
          <text size="small" color="#818384" grow>
            {webhookUrl || '(not configured)'}
          </text>
        </hstack>
        <button onPress={() => alert('Edit endpoint feature coming soon')}>
          ⚙️ Configure Webhook
        </button>
      </vstack>

      {/* Auto-notify Toggle */}
      <vstack gap="small" padding="medium" backgroundColor="#1A1A1B" cornerRadius="medium">
        <hstack alignment="center" gap="small" grow>
          <vstack grow gap="xsmall">
            <text weight="bold">Auto-Notify ModBox</text>
            <text size="small" color="#818384">
              Automatically notify ModBox when config changes
            </text>
          </vstack>
          <button
            onPress={() => setAutoNotify(!autoNotify)}
            appearance={autoNotify ? 'primary' : 'secondary'}
          >
            {autoNotify ? '✓' : '✗'}
          </button>
        </hstack>
      </vstack>

      {/* Debug Information */}
      <vstack gap="small" padding="medium" backgroundColor="#1A1A1B" cornerRadius="medium">
        <text weight="bold">Debug Information</text>
        <text size="xsmall" color="#818384" fontFamily="monospace">
          App Version: 1.0.0
        </text>
        <text size="xsmall" color="#818384" fontFamily="monospace">
          Storage Backend: Redis KVStore
        </text>
        <button onPress={() => alert('Debug logs would be shown here')}>
          📋 View Debug Logs
        </button>
      </vstack>

      {/* Future Features */}
      <vstack
        gap="small"
        padding="medium"
        backgroundColor="#1A1A1B"
        cornerRadius="medium"
      >
        <text weight="bold" size="small">Coming Soon:</text>
        <text size="xsmall" color="#818384">• Automation rules & triggers</text>
        <text size="xsmall" color="#818384">• Audit log export</text>
        <text size="xsmall" color="#818384">• Custom hotkeys</text>
        <text size="xsmall" color="#818384">• Backup & restore</text>
      </vstack>

      {statusMessage && (
        <text size="small" color="#52CC52" alignment="center">
          {statusMessage}
        </text>
      )}

      <button
        onPress={handleSaveSettings}
        appearance="primary"
      >
        💾 Save Settings
      </button>
    </vstack>
  );
};

export default Settings;
