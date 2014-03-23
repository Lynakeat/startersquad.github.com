require 'cgi'

module SassExtensions::Functions

  def escape_url(data)
    string = data.value.to_s
    escaped_string = CGI.escape(string)
    Sass::Script::String.new(escaped_string, :indentifier)
  end

  Sass::Script::Functions.declare :escape_url, args: [:data]

end
