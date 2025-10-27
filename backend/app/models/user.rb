class User < ApplicationRecord
  has_secure_password

  enum role: { guest: 0, admin: 1 }

  has_many :videos, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :role, presence: true
end
