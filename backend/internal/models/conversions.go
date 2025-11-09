package models

// DTOConverter is an interface that allows for a type to be converted to a DTO
type DTOConverter[T any] interface {
	ToDTO() T
}

// ToDTOs converts a slice of DTOConverter types to a slice of DTOs.
// The compiler is not able to infer the type C, so it must be specified.
// Example usage:
//
//	ToDTOs[dtos.Greeting](greetings)
func ToDTOs[C any, T DTOConverter[C]](convertibles []T) []C {
	dtos := make([]C, len(convertibles))
	for i, convertible := range convertibles {
		dtos[i] = convertible.ToDTO()
	}
	return dtos
}
