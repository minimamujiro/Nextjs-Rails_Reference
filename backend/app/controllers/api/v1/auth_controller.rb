class Api::V1::AuthController < ApplicationController
  include JwtAuthenticable

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      unless user.admin?
        render json: { error: 'Only administrators can login' }, status: :unauthorized
        return
      end

      token = encode_token({ user_id: user.id })
      set_auth_cookie(token)

      render json: { user: serialize_user(user) }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def logout
    clear_auth_cookie
    head :no_content
  end

  def me
    if current_user
      render json: { user: serialize_user(current_user) }, status: :ok
    else
      head :unauthorized
    end
  end

  private

  def serialize_user(user)
    {
      id: user.id,
      email: user.email,
      role: user.role
    }
  end

  def cookie_options
    options = {
      httponly: true,
      secure: Rails.env.production?,
      same_site: :lax
    }

    if ENV["COOKIE_DOMAIN"].present?
      options[:domain] = ENV["COOKIE_DOMAIN"]
    end

    options
  end

  def set_auth_cookie(token)
    cookies.signed[:auth_token] = cookie_options.merge(value: token)
  end

  def clear_auth_cookie
    cookies.delete(:auth_token, cookie_options)
  end
end

