class Api::V1::AuthController < ApplicationController
  include JwtAuthenticable

  def login
    user = User.find_by(email: params[:email])
    
    if user && user.authenticate(params[:password])
      unless user.admin?
        render json: { error: 'Only administrators can login' }, status: :unauthorized
        return
      end

      token = encode_token({ user_id: user.id })
      render json: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end

  def logout
    render json: { message: 'Logged out successfully' }, status: :ok
  end
end

