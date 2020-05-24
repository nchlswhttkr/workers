package main

var called = 0

func main() {
	called++
	println("Hello from TinyGo! Called ", called, "times so far")
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
