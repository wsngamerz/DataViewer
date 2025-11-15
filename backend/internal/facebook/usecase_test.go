package facebook

import (
	"testing"
)

func TestFixMessageEncoding(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{
			name:  "ASCII unchanged",
			input: "Hello, world!",
			want:  "Hello, world!",
		},
		{
			name:  "Empty string",
			input: "",
			want:  "",
		},
		{
			name:  "Example message 1",
			input: "Especially as thereâ\u0080\u0099s issues and I donâ\u0080\u0099t want to miss out if anything happens",
			want:  "Especially as there’s issues and I don’t want to miss out if anything happens",
		},
		{
			name:  "Example message 2",
			input: "ð\u009F\u0098\u0082ð\u009F\u0098\u0082ð\u009F\u0098\u0082",
			want:  "😂😂😂",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := fixTextEncoding(tt.input)
			if got != tt.want {
				t.Fatalf("\nTest case: %s\nInput:    %q\nExpected: %q\nGot:      %q\n", tt.name, tt.input, tt.want, got)
			} else {
				t.Logf("PASS: %s\nInput:    %q\nOutput:   %q\n", tt.name, tt.input, got)
			}
		})
	}
}
