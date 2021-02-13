package convert

import "github.com/buildkite/terminal-to-html"

func main(){}

//export convert
func convert(logs string) string {
	var bytes []byte = []byte(logs)
	var html = terminal.Render(bytes)
	return string(html)
}