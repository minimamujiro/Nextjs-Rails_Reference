class Api::V1::UploadsController < ApplicationController
  before_action :authenticate_admin

  def presign
    file = upload_params
    key = build_object_key(file[:file_type], file[:filename])

    presigner = Aws::S3::Presigner.new
    upload_url = presigner.presigned_url(
      :put_object,
      bucket: s3_bucket,
      key: key,
      content_type: file[:content_type],
      expires_in: 300
    )

    render json: {
      upload_url: upload_url,
      file_url: public_url_for(key)
    }
  rescue Aws::Errors::MissingRegionError, Aws::Sigv4::Errors::MissingCredentialsError => e
    render json: { error: e.message }, status: :internal_server_error
  rescue KeyError => e
    render json: { error: "Missing environment variable: #{e.message}" }, status: :unprocessable_entity
  end

  private

  def upload_params
    params.require(:upload).permit(:filename, :contentType, :fileType).tap do |attrs|
      attrs[:file_type] ||= "video"
      unless %w[video thumbnail].include?(attrs[:file_type])
        raise ActionController::ParameterMissing, "file_type must be either 'video' or 'thumbnail'"
      end
    end
  end

  def s3_bucket
    ENV.fetch("AWS_S3_BUCKET")
  end

  def build_object_key(file_type, filename)
    prefix = file_type == "thumbnail" ? "thumbnails" : "videos"
    "#{prefix}/#{SecureRandom.uuid}/#{filename}"
  end

  def public_url_for(key)
    return "#{ENV["AWS_CLOUDFRONT_URL"].chomp("/")}/#{key}" if ENV["AWS_CLOUDFRONT_URL"].present?

    region = ENV.fetch("AWS_REGION", "ap-northeast-1")
    "https://#{s3_bucket}.s3.#{region}.amazonaws.com/#{key}"
  end
end
