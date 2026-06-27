# frozen_string_literal: true

# Allow embedding Chatwoot in the IntelliVerse admin hub iframe.
# Replaces Rails default X-Frame-Options: SAMEORIGIN with a scoped frame-ancestors CSP.
class AdminPortalEmbedHeaders
  DEFAULT_FRAME_ANCESTORS = [
    "'self'",
    'https://admin.intelli-verse-x.ai',
    'http://localhost:3000',
    'http://localhost:3001'
  ].freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, response = @app.call(env)
    apply_embed_headers!(headers) if html_response?(headers)
    [status, headers, response]
  end

  private

  def html_response?(headers)
    headers['Content-Type'].to_s.start_with?('text/html')
  end

  def apply_embed_headers!(headers)
    headers.delete('X-Frame-Options')

    csp = headers['Content-Security-Policy'].to_s
    return if csp.include?('frame-ancestors')

    ancestors = frame_ancestors.join(' ')
    headers['Content-Security-Policy'] = csp.present? ? "#{csp}; frame-ancestors #{ancestors}" : "frame-ancestors #{ancestors}"
  end

  def frame_ancestors
    from_env = ENV.fetch('ADMIN_PORTAL_FRAME_ANCESTORS', '').split(/\s+/).map(&:strip).reject(&:blank?)
    from_env.presence || DEFAULT_FRAME_ANCESTORS
  end
end
