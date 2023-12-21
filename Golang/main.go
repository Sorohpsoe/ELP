package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
)

func main() {
	// Ouvrir le fichier en lecture
	file, err := os.Open("../texte.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	// Créer un scanner pour lire le fichier ligne par ligne
	scanner := bufio.NewScanner(file)

	// Lire chaque ligne du fichier
	for scanner.Scan() {
		line := scanner.Text() // Obtenir la ligne courante
		fmt.Println(line)      // Afficher la ligne
	}

	// Vérifier les erreurs lors de la lecture
	if err := scanner.Err(); err != nil {
		log.Fatal(err)
	}
}
