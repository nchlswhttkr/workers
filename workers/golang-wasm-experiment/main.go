package main

func main() {
	println("Hello from TinyGo!")
}

//go:export multiply
func multiply(x, y int) int {
	return x * y
}

//go:export runSayHello
func runSayHello() {
	sayHello()
}

func sayHello()
