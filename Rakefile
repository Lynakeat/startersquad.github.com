require 'rubygems'
require 'bundler/setup'
Bundler.require(:default)
require './_/sass/sass_extensions.rb'

task :scss do
  sass_engine = Sass::Engine.for_file('_/sass/style.scss', {
    :style => :compressed,
  })
  File.open('_/css/style.css', 'w') do |f|
    f.puts AutoprefixerRails.process(sass_engine.render)
  end
end
