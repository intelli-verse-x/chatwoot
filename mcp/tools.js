// Chatwoot MCP tool catalog. Wraps the Chatwoot application API v1.
// Docs: https://www.chatwoot.com/developers/api/
// Auth: Chatwoot uses a custom `api_access_token` header (no scheme).
// Multi-tenancy: accountId == app-id tenant (one Chatwoot Account per app owner).
export const SERVER = {
  name: 'chatwoot-mcp',
  version: '0.1.0',
  baseUrlEnv: 'CHATWOOT_BASE_URL',
  defaultBaseUrl: 'https://inbox.intelli-verse-x.ai',
  authHeaderName: 'api_access_token',
  authScheme: '',
  instructions:
    'Omnichannel inbox tools for Chatwoot (IG/FB/X DMs, WhatsApp, email, live chat). ' +
    'Authenticate with a Chatwoot access token via Authorization: Bearer; it is forwarded as api_access_token. ' +
    'accountId identifies the app-id tenant.',
};

const q = (params) => {
  const s = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) if (v !== undefined && v !== null && v !== '') s.set(k, String(v));
  const str = s.toString();
  return str ? `?${str}` : '';
};
const acct = (a) => `/api/v1/accounts/${encodeURIComponent(a.accountId)}`;

export const TOOLS = [
  {
    name: 'chatwoot_list_conversations',
    description: 'List conversations in an account inbox, optionally filtered by status (open/resolved/pending).',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: {
        accountId: { type: 'number', description: 'Chatwoot account id (app-id tenant).' },
        status: { type: 'string', enum: ['open', 'resolved', 'pending', 'snoozed', 'all'] },
        page: { type: 'number' },
      },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/conversations${q({ status: a.status, page: a.page })}`),
  },
  {
    name: 'chatwoot_get_conversation',
    description: 'Get a single conversation (messages, contact, channel, labels).',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'conversationId'],
      properties: { accountId: { type: 'number' }, conversationId: { type: 'number' } },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/conversations/${encodeURIComponent(a.conversationId)}`),
  },
  {
    name: 'chatwoot_send_message',
    description: 'Post a reply (or private note) to a conversation.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'conversationId', 'content'],
      properties: {
        accountId: { type: 'number' },
        conversationId: { type: 'number' },
        content: { type: 'string', description: 'Message body.' },
        private: { type: 'boolean', description: 'If true, an internal note not sent to the contact.' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/conversations/${encodeURIComponent(a.conversationId)}/messages`, {
        method: 'POST',
        body: { content: a.content, message_type: 'outgoing', private: !!a.private },
      }),
  },
  {
    name: 'chatwoot_list_contacts',
    description: 'List contacts in an account.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: { accountId: { type: 'number' }, page: { type: 'number' } },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/contacts${q({ page: a.page })}`),
  },
  {
    name: 'chatwoot_create_contact',
    description: 'Create a contact in an account (lead capture).',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'name'],
      properties: {
        accountId: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone_number: { type: 'string', description: 'E.164 phone number.' },
        identifier: { type: 'string', description: 'External id to dedupe across systems.' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/contacts`, {
        method: 'POST',
        body: { name: a.name, email: a.email, phone_number: a.phone_number, identifier: a.identifier },
      }),
  },
  {
    name: 'chatwoot_add_labels',
    description: 'Replace the labels on a conversation (e.g. tag with the app-id or routing label).',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'conversationId', 'labels'],
      properties: {
        accountId: { type: 'number' },
        conversationId: { type: 'number' },
        labels: { type: 'array', items: { type: 'string' } },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/conversations/${encodeURIComponent(a.conversationId)}/labels`, {
        method: 'POST',
        body: { labels: a.labels },
      }),
  },
  {
    name: 'chatwoot_toggle_status',
    description: 'Change conversation status (open/resolved/pending).',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'conversationId', 'status'],
      properties: {
        accountId: { type: 'number' },
        conversationId: { type: 'number' },
        status: { type: 'string', enum: ['open', 'resolved', 'pending'] },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/conversations/${encodeURIComponent(a.conversationId)}/toggle_status`, {
        method: 'POST',
        body: { status: a.status },
      }),
  },
];
