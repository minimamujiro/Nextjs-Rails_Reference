class ApplicationController < ActionController::API
  include ActionController::Cookies
  include JwtAuthenticable

  rescue_from StandardError, with: :handle_error

  private

  def handle_error(error)
    Rails.logger.error(error.message)
    Rails.logger.error(error.backtrace.join("\n"))
    render json: { error: error.message }, status: :internal_server_error
  end
end

