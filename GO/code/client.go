package main

import (
	"fmt"
	"net"
	"os"
	"strings"
)

func main() {
	// Check if the correct number of command-line arguments is provided
	if len(os.Args) != 3 {
		fmt.Println("Usage: go run client.go <csv_walls.csv> <csv_endpoints.csv>")
		return
	}

	wallsname := os.Args[1]
	endpointsname := os.Args[2]

	if !strings.HasSuffix(wallsname, ".csv") {
		wallsname += ".csv"
	}

	if !strings.HasSuffix(endpointsname, ".csv") {
		endpointsname += ".csv"
	}

	pwd, _ := os.Getwd()
	pathendpoints := pwd + "/data_to_send/endpoints/" + endpointsname
	pathwalls := pwd + "/data_to_send/walls/" + wallsname

	// Connect to the server
	conn, err := net.Dial("tcp", "localhost:8080")
	if err != nil {
		fmt.Println(err)
		return
	}

	// Send the first CSV file to the server
	sendCSVFile(conn, pathwalls)

	// Send the second CSV file to the server
	sendCSVFile(conn, pathendpoints)

	buf := make([]byte, 1024)
	n, err := conn.Read(buf)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Printf("Server response: %s\n", string(buf[:n]))

	// Close the connection
	conn.Close()
}

func sendCSVFile(conn net.Conn, filename string) {
	// Open the CSV file for reading
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer file.Close()

	// Create a buffer to store data chunks
	buf := make([]byte, 1024)

	// Read the file and send data to the server
	for {
		n, err := file.Read(buf)
		if err != nil {
			break // End of file
		}

		// Send the data chunk to the server
		_, err = conn.Write(buf[:n])
		if err != nil {
			fmt.Println(err)
			return
		}
	}
}
