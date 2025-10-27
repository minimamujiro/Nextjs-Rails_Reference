# Create admin user
admin = User.find_or_create_by!(email: 'admin@example.com') do |user|
  user.password = 'password123'
  user.role = :admin
end

puts "Admin user created: #{admin.email}"
puts "Password: password123"

# Create sample videos for testing
if admin.videos.count.zero?
  5.times do |i|
    admin.videos.create!(
      title: "Sample Video #{i + 1}",
      description: "This is a sample video description #{i + 1}",
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4",
      thumbnail_url: "https://github.com/minimamujiro/image_repo/blob/main/thumbnail01.jpg?raw=true"
    )
  end
  puts "Created 5 sample videos"
end
