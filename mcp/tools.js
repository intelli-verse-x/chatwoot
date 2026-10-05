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
  {
    name: 'chatwoot_create_conversation',
    description: 'Open a new conversation in an inbox for an existing contact.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'inboxId', 'contactId', 'sourceId'],
      properties: {
        accountId: { type: 'number' },
        inboxId: { type: 'number' },
        contactId: { type: 'number' },
        sourceId: { type: 'string', description: 'Channel source id for this contact in the inbox.' },
        content: { type: 'string', description: 'Optional first message.' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/conversations`, {
        method: 'POST',
        body: {
          inbox_id: a.inboxId,
          contact_id: a.contactId,
          source_id: a.sourceId,
          ...(a.content ? { message: { content: a.content } } : {}),
        },
      }),
  },
  {
    name: 'chatwoot_assign_conversation',
    description: 'Assign a conversation to an agent or a team.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'conversationId'],
      properties: {
        accountId: { type: 'number' },
        conversationId: { type: 'number' },
        assigneeId: { type: 'number', description: 'Agent user id. Omit to assign a team instead.' },
        teamId: { type: 'number' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/conversations/${encodeURIComponent(a.conversationId)}/assignments`, {
        method: 'POST',
        body: {
          ...(a.assigneeId != null ? { assignee_id: a.assigneeId } : {}),
          ...(a.teamId != null ? { team_id: a.teamId } : {}),
        },
      }),
  },
  {
    name: 'chatwoot_update_contact',
    description: 'Update a contact name, email, phone, or identifier.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'contactId'],
      properties: {
        accountId: { type: 'number' },
        contactId: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        phone_number: { type: 'string' },
        identifier: { type: 'string' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/contacts/${encodeURIComponent(a.contactId)}`, {
        method: 'PUT',
        body: {
          name: a.name,
          email: a.email,
          phone_number: a.phone_number,
          identifier: a.identifier,
        },
      }),
  },
  {
    name: 'chatwoot_search_contacts',
    description: 'Search contacts by name, email, or phone.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'q'],
      properties: {
        accountId: { type: 'number' },
        q: { type: 'string' },
        page: { type: 'number' },
      },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/contacts/search${q({ q: a.q, page: a.page })}`),
  },
  {
    name: 'chatwoot_list_inboxes',
    description: 'List inboxes on the account.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: { accountId: { type: 'number' } },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/inboxes`),
  },
  {
    name: 'chatwoot_list_agents',
    description: 'List agents who can be assigned conversations.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: { accountId: { type: 'number' } },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/agents`),
  },
  {
    name: 'chatwoot_list_canned_responses',
    description: 'List saved replies for the account.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: { accountId: { type: 'number' }, search: { type: 'string' } },
    },
    handler: (a, ctx) => ctx.api(`${acct(a)}/canned_responses${q({ search: a.search })}`),
  },
  {
    name: 'chatwoot_create_canned_response',
    description: 'Save a reply shortcut.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'shortCode', 'content'],
      properties: {
        accountId: { type: 'number' },
        shortCode: { type: 'string' },
        content: { type: 'string' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/canned_responses`, {
        method: 'POST',
        body: { canned_response: { short_code: a.shortCode, content: a.content } },
      }),
  },
  {
    name: 'chatwoot_list_attachments',
    description: 'List files already attached to a conversation.',
    inputSchema: {
      type: 'object',
      required: ['accountId', 'conversationId'],
      properties: { accountId: { type: 'number' }, conversationId: { type: 'number' } },
    },
    handler: (a, ctx) =>
      ctx.api(`${acct(a)}/conversations/${encodeURIComponent(a.conversationId)}/attachments`),
  },
  {
    name: 'chatwoot_reports_summary',
    description: 'Account conversation summary for a time range.',
    inputSchema: {
      type: 'object',
      required: ['accountId'],
      properties: {
        accountId: { type: 'number' },
        since: { type: 'string', description: 'Range start as Unix seconds.' },
        until: { type: 'string', description: 'Range end as Unix seconds.' },
      },
    },
    handler: (a, ctx) =>
      ctx.api(`/api/v2/accounts/${encodeURIComponent(a.accountId)}/reports/summary${q({ type: 'account', since: a.since, until: a.until })}`),
  },
];
