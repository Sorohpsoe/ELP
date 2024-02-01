package main

import (
	"encoding/csv"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	// Listen for incoming connections on port 8080
	ln, err := net.Listen("tcp", ":8080")
	if err != nil {
		fmt.Println(err)
		return
	}

	// Accept incoming connections and handle them
	for {
		conn, err := ln.Accept()
		if err != nil {
			fmt.Println(err)
			continue
		}

		// Handle the connection in a new goroutine
		go handleConnection(conn)
	}
}

func handleConnection(conn net.Conn) {
	// Close the connection when we're done
	defer conn.Close()

	// Specify the parent directory for the "walls" and "endpoints" folders
	parentDir := "../data"

	// Process the first CSV file and save it to the "walls" folder
	processCSV(conn, filepath.Join(parentDir, "walls"), "walls.csv")

	// Process the second CSV file and save it to the "endpoints" folder
	processCSV(conn, filepath.Join(parentDir, "endpoints"), "endpoints.csv")

	processCSVFile(filepath.Join(parentDir, "walls", "walls.csv"), filepath.Join(parentDir, "endpoints", "endpoints.csv"))

	conn.Write([]byte("Terminé"))
}
func processCSV(conn net.Conn, folderName, filename string) {
	// Create a buffer to store incoming data
	buf := make([]byte, 1024)
	var fileContent []byte

	// Read incoming data until the end
	for {
		n, err := conn.Read(buf)
		if err != nil {
			fmt.Println(err)
			return
		}

		// Append the received data to the fileContent slice
		fileContent = append(fileContent, buf[:n]...)

		// Check if we've reached the end of the file
		if n < len(buf) {
			break
		}
	}

	// Create the folder if it doesn't exist
	err := os.MkdirAll(folderName, os.ModePerm)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Save the received data to a CSV file in the specified folder
	err = saveToFile(fileContent, filepath.Join(folderName, filename))
	if err != nil {
		fmt.Println(err)
		return
	}
}

func saveToFile(data []byte, filename string) error {
	// Open the file for writing
	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	// Write the data to the file
	_, err = file.Write(data)
	if err != nil {
		return err
	}

	return nil
}

func processCSVFile(filename1 string, filename2 string) {
	// Open the CSV file
	filenames := []string{filename1, filename2}
	for _, filename := range filenames {
		file, err := os.Open(filename)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer file.Close()

		// Create a CSV reader
		reader := csv.NewReader(file)

		// Read and process each CSV line
		for {
			// Read a single CSV record (line)
			record, err := reader.Read()
			if err != nil {
				break // End of file
			}

			// Process the CSV record (line)
			processCSVRecord(record)

		}

	}
}

func processCSVRecord(record []string) {
	// Your logic to process each CSV record goes here
	// For example, you can print or perform operations on each record.
	// Implement your logic according to your requirements.
	fmt.Printf("CSV Record: %s\n", strings.Join(record, ", "))
	// Add your record processing logic here
}
