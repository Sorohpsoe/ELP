package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	// Nom du fichier d'entrée
	inputFileName := "C:/Users/baptr/Documents/INSA/TC/GO/ELP/Golang/texte.txt"

	// Nom du fichier de sortie
	outputFileName := "output.txt"

	// Ouvrir le fichier d'entrée en lecture
	inputFile, err := os.Open(inputFileName)
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier d'entrée:", err)
		return
	}
	defer inputFile.Close()

	// Ouvrir le fichier de sortie en écriture
	outputFile, err := os.Create(outputFileName)
	if err != nil {
		fmt.Println("Erreur lors de la création du fichier de sortie:", err)
		return
	}
	defer outputFile.Close()

	// Créer un scanner pour lire le fichier ligne par ligne
	scanner := bufio.NewScanner(inputFile)

	// Parcourir chaque ligne du fichier d'entrée
	for scanner.Scan() {
		line := scanner.Text()

		// Diviser la ligne en mots
		words := strings.Fields(line)

		// Imprimer le dernier mot de la ligne
		if len(words) > 0 {
			lastWord := words[len(words)-1]
			fmt.Println("Dernier mot de la ligne:", lastWord)

			// Écrire le dernier mot dans le fichier de sortie
			_, err := outputFile.WriteString(lastWord + "\n")
			if err != nil {
				fmt.Println("Erreur lors de l'écriture dans le fichier de sortie:", err)
				return
			}
		}
	}

	// Vérifier les erreurs potentielles lors de la fin de la numérisation
	if err := scanner.Err(); err != nil {
		fmt.Println("Erreur lors de la numérisation du fichier d'entrée:", err)
	}
}
