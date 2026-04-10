/**
 * ConfigEditor Screen - Removal Reasons & Usernotes Management
 */

import { Devvit, useAsync, useState, useSubredditName, useCurrentUser } from '@devvit/public-api';
import { getRemovalReasons, saveRemovalReasons, getUsernoteConfig, saveUsernoteConfig } from '../storage.js';
import { notifyModBoxConfigChange, logConfigChange } from '../notifications.js';
import type { RemovalReasonSet, UsernoteType, RemovalReason } from '../types.js';

const ConfigEditor: Devvit.BlockComponent = () => {
  const subreddit = useSubredditName();
  const user = useCurrentUser();
  const [mode, setMode] = useState<'reasons' | 'usernotes'>('reasons');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Load removal reasons
  const { data: reasonsData, loading: reasonsLoading } = useAsync(async () => {
    return await getRemovalReasons(subreddit);
  });

  // Load usernote config
  const { data: usernoteData, loading: usernoteLoading } = useAsync(async () => {
    return await getUsernoteConfig(subreddit);
  });

  const [reasons, setReasons] = useState<RemovalReasonSet[]>(reasonsData || []);
  const [usernotes, setUsernotes] = useState<UsernoteType[]>(usernoteData?.types || getDefaultUsernoteTypes());

  // Handle saving removal reasons
  const handleSaveReasons = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage('Saving removal reasons...');

    const success = await saveRemovalReasons(subreddit, reasons);
    if (success) {
      await logConfigChange(subreddit, 'removal_reasons_updated', {}, user.username);
      setStatusMessage('✅ Removal reasons saved successfully');
      
      // Notify ModBox
      await notifyModBoxConfigChange(
        {
          type: 'reasons_changed',
          subreddit,
          changedFields: ['reasons'],
          timestamp: Date.now(),
          modifiedBy: user.username,
        },
        undefined // would get webhook URL from settings
      );
    } else {
      setStatusMessage('❌ Failed to save removal reasons');
    }

    setIsSaving(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle saving usernote config
  const handleSaveUsernotes = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage('Saving usernote types...');

    const config = {
      types: usernotes,
      maxNoteLength: 300,
      allowedRemovalReasons: [],
      createdAt: usernoteData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    const success = await saveUsernoteConfig(subreddit, config);
    if (success) {
      await logConfigChange(subreddit, 'usernotes_updated', {}, user.username);
      setStatusMessage('✅ Usernote types saved successfully');
      
      // Notify ModBox
      await notifyModBoxConfigChange(
        {
          type: 'usernotes_changed',
          subreddit,
          changedFields: ['types', 'colors'],
          timestamp: Date.now(),
          modifiedBy: user.username,
        },
        undefined
      );
    } else {
      setStatusMessage('❌ Failed to save usernote types');
    }

    setIsSaving(false);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  if (reasonsLoading || usernoteLoading) {
    return (
      <vstack alignment="center" padding="medium">
        <text>Loading configuration...</text>
      </vstack>
    );
  }

  return (
    <vstack gap="medium" padding="medium" grow>
      {/* Mode Selector */}
      <hstack gap="small">
        <button
          onPress={() => setMode('reasons')}
          appearance={mode === 'reasons' ? 'primary' : 'secondary'}
        >
          📋 Removal Reasons
        </button>
        <button
          onPress={() => setMode('usernotes')}
          appearance={mode === 'usernotes' ? 'primary' : 'secondary'}
        >
          📝 Usernote Types
        </button>
      </hstack>

      {/* Removal Reasons Editor */}
      {mode === 'reasons' && (
        <vstack gap="medium" grow>
          <text weight="bold" size="large">
            Removal Reasons Configuration
          </text>
          <text size="small" color="#818384">
            Manage removal reason sets and templates used by ModBox
          </text>

          {reasons.length === 0 ? (
            <vstack alignment="center" padding="large" backgroundColor="#1A1A1B" cornerRadius="medium">
              <text color="#818384">No removal reasons configured yet</text>
              <button onPress={() => alert('Add new reason set feature coming soon')}>
                ➕ Add Reason Set
              </button>
            </vstack>
          ) : (
            <vstack gap="small" maxHeight="400px" grow>
              {reasons.map((reasonSet) => (
                <vstack
                  key={reasonSet.setId}
                  padding="medium"
                  backgroundColor="#1A1A1B"
                  cornerRadius="medium"
                  gap="small"
                >
                  <hstack alignment="center" gap="small">
                    <text weight="bold" grow>
                      {reasonSet.name}
                    </text>
                    {reasonSet.isDefault && (
                      <text size="small" color="#818384">
                        (Default)
                      </text>
                    )}
                  </hstack>
                  <text size="small" color="#818384">
                    {reasonSet.reasons.length} reasons
                  </text>
                  <button onPress={() => alert('Edit feature coming soon')}>Edit</button>
                </vstack>
              ))}
            </vstack>
          )}

          {statusMessage && (
            <text size="small" color={statusMessage.includes('✅') ? '#00DD00' : '#DD0000'}>
              {statusMessage}
            </text>
          )}

          <button
            onPress={handleSaveReasons}
            appearance="primary"
            disabled={isSaving}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Removal Reasons'}
          </button>
        </vstack>
      )}

      {/* Usernote Types Editor */}
      {mode === 'usernotes' && (
        <vstack gap="medium" grow>
          <text weight="bold" size="large">
            Usernote Type Configuration
          </text>
          <text size="small" color="#818384">
            Customize the usernote types, colors, and labels available to moderators
          </text>

          <vstack gap="small" maxHeight="400px" grow>
            {usernotes.map((type) => (
              <vstack
                key={type.code}
                padding="medium"
                backgroundColor="#1A1A1B"
                cornerRadius="medium"
                gap="small"
              >
                <hstack alignment="center" gap="medium" grow>
                  <vstack gap="xsmall" grow>
                    <hstack alignment="center" gap="small">
                      <text
                        weight="bold"
                        color={type.color}
                        size="large"
                      >
                        ●
                      </text>
                      <text weight="bold">{type.label}</text>
                      <text size="small" color="#818384">
                        ({type.code})
                      </text>
                    </hstack>
                    {type.description && (
                      <text size="small" color="#818384">
                        {type.description}
                      </text>
                    )}
                  </vstack>
                  <button onPress={() => alert('Edit feature coming soon')}>✏️</button>
                </hstack>
              </vstack>
            ))}
          </vstack>

          {statusMessage && (
            <text size="small" color={statusMessage.includes('✅') ? '#00DD00' : '#DD0000'}>
              {statusMessage}
            </text>
          )}

          <button
            onPress={handleSaveUsernotes}
            appearance="primary"
            disabled={isSaving}
          >
            {isSaving ? '💾 Saving...' : '💾 Save Usernote Types'}
          </button>
        </vstack>
      )}
    </vstack>
  );
};

function getDefaultUsernoteTypes(): UsernoteType[] {
  return [
    {
      code: 'N',
      label: 'Note',
      color: '#9494FF',
      description: 'General moderator note',
      enabled: true,
    },
    {
      code: 'W',
      label: 'Warning',
      color: '#FFB894',
      description: 'User warning',
      enabled: true,
    },
    {
      code: 'B',
      label: 'Ban',
      color: '#FF3636',
      description: 'User banned',
      enabled: true,
    },
    {
      code: 'M',
      label: 'Mute',
      color: '#9B59B6',
      description: 'User muted',
      enabled: true,
    },
    {
      code: 'P',
      label: 'Positive',
      color: '#52CC52',
      description: 'Positive interaction',
      enabled: true,
    },
  ];
}

export default ConfigEditor;
