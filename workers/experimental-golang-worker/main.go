package main

var called = 0

func main() {
	called++
	println("Hello from TinyGo! Called", called, "times so far!")
}

//export multiply
func multiply(x, y int) int {
	return x * y
}

//export runSayHello
func runSayHello() {
	sayHello()
}

func sayHello()
