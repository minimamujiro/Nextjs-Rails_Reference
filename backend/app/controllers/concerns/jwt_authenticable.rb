module JwtAuthenticable
  SECRET_KEY = Rails.application.credentials.secret_key_base || 'your-secret-key'

  def encode_token(payload)
    JWT.encode(payload, SECRET_KEY)
  end

  def decode_token(token)
    JWT.decode(token, SECRET_KEY, true, algorithm: 'HS256')[0]
  rescue JWT::DecodeError
    nil
  end

  def current_user
    token = auth_token
    return nil unless token

    decoded = decode_token(token)
    @current_user ||= User.find(decoded['user_id']) if decoded
  rescue ActiveRecord::RecordNotFound
    nil
  end

  def authenticate_admin
    unless current_user&.admin?
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  private

  def auth_token
    cookies.signed[:auth_token] || authorization_header_token
  end

  def authorization_header_token
    request.headers['Authorization']&.split(' ')&.last
  end
end

