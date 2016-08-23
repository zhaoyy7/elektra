$:.push File.expand_path("../lib", __FILE__)



# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "key_manager"
  s.version     = "0.0.1"
  s.authors     = [" Write your name"]
  s.email       = [" Write your email address"]
  s.homepage    = ""
  s.summary     = " Summary of KeyManager."
  s.description = " Description of KeyManager."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]

  s.add_dependency 'activeresource'
  s.add_dependency 'activeresource-response'
  s.add_dependency 'virtus'
end
