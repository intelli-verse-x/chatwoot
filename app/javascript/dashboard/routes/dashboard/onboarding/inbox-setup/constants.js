// Channels offered in the onboarding "View all" dialog. `inbox` is a stub shaped
// like a real inbox so ChannelIcon can resolve the icon from the shared provider.
// With `use-brand-icon`, ChannelIcon renders the full-color brand logo when one
// exists and falls back to the monochrome glyph otherwise, so no per-channel
// style flag is needed. Entries without a channel type (Voice, Other Email
// Providers) render `fallbackIcon` instead. `form: true` swaps the grid for an
// inline credential form; `setupLater: true` defers the channel to in-app setup
// for this phase.
export const CHANNEL_LIST = [
  {
    type: 'website',
    label: 'Website',
    inbox: { channel_type: 'Channel::WebWidget' },
  },
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    inbox: { channel_type: 'Channel::Whatsapp' },
  },
  {
    type: 'instagram',
    label: 'Instagram',
    inbox: { channel_type: 'Channel::Instagram' },
  },
  {
    type: 'facebook',
    label: 'Facebook',
    inbox: { channel_type: 'Channel::FacebookPage' },
  },
  {
    type: 'tiktok',
    label: 'TikTok',
    inbox: { channel_type: 'Channel::Tiktok' },
  },
  {
    type: 'telegram',
    label: 'Telegram',
    inbox: { channel_type: 'Channel::Telegram' },
    form: true,
  },
  {
    type: 'line',
    label: 'LINE',
    inbox: { channel_type: 'Channel::Line' },
    form: true,
  },
  // Email channels (including Gmail/Outlook OAuth) are set up later in-app for
  // this phase; they will be enabled in a future PR.
  {
    type: 'gmail',
    label: 'Gmail',
    inbox: { channel_type: 'Channel::Email', provider: 'google' },
    setupLater: true,
  },
  {
    type: 'outlook',
    label: 'Outlook',
    inbox: { channel_type: 'Channel::Email', provider: 'microsoft' },
    setupLater: true,
  },
  {
    type: 'sms',
    label: 'SMS',
    inbox: { channel_type: 'Channel::Sms' },
    setupLater: true,
  },
  {
    type: 'api',
    label: 'API',
    inbox: { channel_type: 'Channel::Api' },
    setupLater: true,
  },
  {
    type: 'voice',
    label: 'Voice',
    fallbackIcon: 'i-woot-voice',
    setupLater: true,
  },
  {
    type: 'email',
    label: 'Other Email Providers',
    fallbackIcon: 'i-woot-mail',
    setupLater: true,
  },
];

const channelByType = type =>
  CHANNEL_LIST.find(channel => channel.type === type);

// Icons shown next to "View all" when every detected channel is already
// connected — a representative trio sourced from CHANNEL_LIST so the inbox stubs
// aren't duplicated.
export const FALLBACK_PREVIEW_CHANNELS = ['gmail', 'tiktok', 'whatsapp'].map(
  channelByType
);

// Social channels that detected brand_info socials map to, keyed by social type
// in the order they're offered as rows. Derived from CHANNEL_LIST so channel
// identity (label, channel_type) has a single source. Keys mirror
// SocialLinkParser::SOCIAL_DOMAIN_MAP.
const SOCIAL_PLATFORM_TYPES = [
  'whatsapp',
  'facebook',
  'line',
  'instagram',
  'telegram',
  'tiktok',
];

export const SOCIAL_PLATFORMS = Object.fromEntries(
  SOCIAL_PLATFORM_TYPES.map(type => {
    const { label, inbox } = channelByType(type);
    return [type, { label, channelType: inbox.channel_type }];
  })
);

// Mailbox providers inferred from the signup domain's MX records, keyed by
// Channel::Email#provider. Derived from CHANNEL_LIST's email entries.
export const EMAIL_PROVIDERS = Object.fromEntries(
  CHANNEL_LIST.filter(channel => channel.inbox?.provider).map(channel => [
    channel.inbox.provider,
    { label: channel.label },
  ])
);
