source 'https://rubygems.org'

# https://bundler.io/v1.5/gemfile.html
# https://guides.rubygems.org/patterns/#semantic-versioning
# Note: check Dockerfile for Version dependencies!
#       Because we install gems with native extension before running bundle install
#       This avoids recompiling them everytime the Gemfile.lock changes.
#       The versions need to be kept in sync with the Gemfile.lock

# Avoid g++ dependency https://github.com/knu/ruby-domain_name/issues/3
# # unf is pulled in by the ruby-arc-client
gem 'unf', '>= 0.2.0beta2'

gem 'rails', '6.1.5.1'
gem 'jsbundling-rails'

gem 'bootstrap-sass'
gem 'haml-rails'
gem 'simple_form'
gem 'redcarpet'
gem 'spinners'

gem 'friendly_id'
gem 'high_voltage'
gem 'simple-navigation' # Navigation menu builder
gem 'font-awesome-sass', '~>4'
gem 'kaminari'

gem 'responders'

# # make it fancy with react
# gem 'react-rails', '~> 2.2.1'

# Database
gem 'pg', '1.3.4'
gem 'activerecord-session_store'

# Openstack
gem 'net-ssh'
gem 'netaddr', '2.0.4'

gem 'colorize'

gem 'ruby-radius'

# Extras
gem 'config', '~> 2.2.1'

# Prometheus instrumentation
gem 'prometheus-client'

# Sentry client
gem 'sentry-raven'
gem 'httpclient' # The only faraday backend that handled no_proxy :|

# Automation
gem 'lyra-client', git: 'https://github.com/sapcc/lyra-client.git'
gem 'arc-client', git: 'https://github.com/sapcc/arc-client.git'
# auth
gem 'monsoon-openstack-auth', git: 'https://github.com/sapcc/monsoon-openstack-auth.git'
# gem 'monsoon-openstack-auth', path: '../monsoon-openstack-auth'

# See https://github.com/sstephenson/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
# gem 'jbuilder', '~> 2.0'
# bundle exec rake doc:rails generates the API under doc/api.
gem 'sdoc', '~> 1.1.0', group: :doc

# if you update puma check Dockerfile for Version dependencies!
# gem 'puma', '= 4.3.9', require: false
gem "puma", "4.3.12"
###################### PLUGINS #####################

# backlist plugins (global)
black_list = [''] # e.g. ['compute']
if ENV.key?('BLACK_LIST_PLUGINS')
  ENV['BLACK_LIST_PLUGINS'].split(',').each { |plugin_name| black_list << plugin_name.strip }
end

# load all plugins except blacklisted plugins
Dir.glob('plugins/*').each do |plugin_path|
  unless black_list.include?(plugin_path.gsub('plugins/', ''))
    gemspec path: plugin_path
  end
end

# email_service
gem 'aws-sdk-ses'
gem 'aws-sdk-sesv2'
######################## END #######################

group :api_client do
  gem 'elektron', git: 'https://github.com/sapcc/elektron', tag: 'v2.2.2'
  # gem 'elektron', path: '../elektron'
end

# Avoid double log lines in development
# See: https://github.com/heroku/rails_stdout_logging/issues/1
group :production do
  # We are not using the railtie because it comes to late,
  # we are setting the logger in production.rb
  gem 'rails_stdout_logging', require: 'rails_stdout_logging/rails'
end

group :development, :production do
  # Views and Assets
  gem 'sass-rails'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> in views
  gem 'web-console'
end

group :development, :test do
  gem 'dotenv-rails'

  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'

  gem 'foreman', '~> 0.87.0'

  # Testing

  gem 'rspec-rails'
  # gem 'factory_girl_rails', '~> 4.0'
  gem "factory_bot_rails"
  gem 'database_cleaner'

  gem 'pry-rails'
  gem 'prettier'
  gem 'listen'
end

group :test do
  gem 'rails-controller-testing'
end
