class Api::V1::VideosController < ApplicationController
  include JwtAuthenticable

  before_action :authenticate_admin, only: [:create, :update, :destroy]
  before_action :set_video, only: [:show, :update, :destroy]

  def index
    @videos = Video.includes(:user).order(created_at: :desc)
    render json: @videos.as_json(include: { user: { only: [:id, :email] } })
  end

  def show
    render json: @video.as_json(include: { user: { only: [:id, :email] } })
  end

  def create
    @video = Video.new(video_params)
    @video.user = current_user

    if @video.save
      render json: @video.as_json(include: { user: { only: [:id, :email] } }), status: :created
    else
      render json: { errors: @video.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @video.update(video_params)
      render json: @video.as_json(include: { user: { only: [:id, :email] } })
    else
      render json: { errors: @video.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @video.destroy
    render json: { message: 'Video deleted successfully' }, status: :ok
  end

  private

  def set_video
    @video = Video.find(params[:id])
  end

  def video_params
    params.require(:video).permit(:title, :description, :video_url, :thumbnail_url)
  end
end

