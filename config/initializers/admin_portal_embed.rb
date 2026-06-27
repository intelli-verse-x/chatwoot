# frozen_string_literal: true

# IntelliVerse admin hub embeds Chatwoot at /admin/tools/chatwoot.
require Rails.root.join('lib/middleware/admin_portal_embed_headers')

Rails.application.config.action_dispatch.default_headers.delete('X-Frame-Options')
Rails.application.config.middleware.use AdminPortalEmbedHeaders
