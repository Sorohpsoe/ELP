# Evacuation Simulation Project in Golang

Welcome to the Evacuation Simulation project in Golang! This project allows users to send maps to the server, which then calculates and provides information on how much time people would need to evacuate the space. Below is a detailed overview of the project structure, files, and instructions for launching the simulation.

## Project Structure

The project is organized into several directories and files:

- **Code:**
  - **with_interface:**
    - `chevron-up.png`: An image used for running the simulation interface.
    - `endpoints.csv`: File specifying the destination coordinates for evacuation.
    - `walls.csv`: File specifying the locations of walls in the simulation.
    - `main.go`: Simulation with an interface to visualize the simulation.
  - `client.go` Script for the to send data to the server
  - `server.go` Script listen for client, simulate and give time of the simulation

- **data_received:**
  - **endpoints:** Folder storing the `endpoints.csv` files received from clients.
  - **walls:** Folder storing the `walls.csv` files received from clients.

- **data_to_send:**
  - **endpoints:** Folder for placing the `endpoints` files that clients will send to the server.
  - **walls:** Folder for placing the `walls` files that clients will send to the server.

- **vect:**
  - `2d.go`: A vector module used in the project.

- `go.mod`: Go module file.
- `go.sum`: Go module checksum file.

## How to Launch the Project

To run the project, follow these steps:

1. Open a terminal.
2. Navigate to the `GO` folder.
3. Launch the server using the command:

    ```bash
    go run ./code/server.go
    ```

4. Open another terminal.
5. Launch the client with the following command:

    ```bash
    go run ./code/client.go {name of your csv walls file} {name of your endpoints csv file}
    ```

6. Optionally, you can run the simulation with the interface:

    ```bash
    go run ./code/with_interface/main.go
    ```

## Server Results

The results provided by the server are "tick-based," indicating the number of updates needed for the simulation to complete. This data allows users to compare multiple simulations with different wall adjustments to determine which configuration is more efficient in case of an emergency.
