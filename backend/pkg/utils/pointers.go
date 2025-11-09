package utils

// NewPtr returns a pointer to the given object.
func NewPtr[T any](obj T) *T {
	return &obj
}
