package main

import (
	"encoding/csv"
	"fmt"
	"math"
	"math/rand"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/healeycodes/boids/vector"
)

type Vector2D = vector.Vector2D
type Time = time.Time

const (
	screenWidth          = 1000
	screenHeight         = 1000
	numBoids             = 150
	maxSpeed             = 4.0
	alignForce           = 1.0
	cohesionForce        = 0.8
	separationForce      = 1.8
	wallsForce           = 3.0
	endpointsForce       = 6
	alignPerception      = 75.0
	cohesionPerception   = 100.0
	separationPerception = 50.0
	wallsPerception      = 50.0
	endpointsPerception  = 400.0
)

func init_walls() []Vector2D {
	// Ouverture du fichier CSV
	file, err := os.Open("Golang/walls/walls.csv")
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier CSV :", err)
	}
	defer file.Close()

	// Création d'un lecteur CSV
	reader := csv.NewReader(file)

	var walls_points []Vector2D

	// Lecture des lignes du fichier
	for {
		// Lecture d'une ligne du fichier
		record, err := reader.Read()

		// Vérification de la fin du fichier
		if err != nil {
			break
		}

		x1, err := strconv.ParseFloat(record[0], 64)
		x2, err := strconv.ParseFloat(record[2], 64)
		y1, err := strconv.ParseFloat(record[1], 64)
		y2, err := strconv.ParseFloat(record[3], 64)

		// Affichage du contenu de la ligne
		distance := math.Sqrt(math.Pow(x2-x1, 2) + math.Pow(y2-y1, 2))

		for i := 0.0; i < distance; i += 2.0 {
			x := x1 + (x2-x1)*i/distance
			y := y1 + (y2-y1)*i/distance
			walls_points = append(walls_points, Vector2D{X: x, Y: y})

		}

	}
	return walls_points

}

func init_endpoints() []Vector2D {
	// Ouverture du fichier CSV
	file, err := os.Open("Golang/endpoints/endpoints.csv")
	if err != nil {
		fmt.Println("Erreur lors de l'ouverture du fichier CSV :", err)
	}
	defer file.Close()

	// Création d'un lecteur CSV
	reader := csv.NewReader(file)

	var endpoints_points []Vector2D

	for {
		// Lecture d'une ligne du fichier
		record, err := reader.Read()

		// Vérification de la fin du fichier
		if err != nil {
			break
		}

		x, err := strconv.ParseFloat(record[0], 64)
		y, err := strconv.ParseFloat(record[1], 64)
		endpoints_points = append(endpoints_points, Vector2D{X: x, Y: y})
	}

	return endpoints_points

}

type Boid struct {
	position     Vector2D
	velocity     Vector2D
	acceleration Vector2D
}

func (boid *Boid) ApplyRules(restOfFlock []*Boid, walls_points []Vector2D, endpoints_points []Vector2D) {
	alignSteering := Vector2D{}
	alignTotal := 0
	cohesionSteering := Vector2D{}
	cohesionTotal := 0
	separationSteering := Vector2D{}
	separationTotal := 0
	wallsSteering := Vector2D{}
	wallsTotal := 0
	endpointsSteering := Vector2D{}
	endpointsTotal := 0

	for _, other := range restOfFlock {
		d := boid.position.Distance(other.position)
		if boid != other {
			if d < alignPerception {
				alignTotal++
				alignSteering.Add(other.velocity)
			}
			if d < cohesionPerception {
				cohesionTotal++
				cohesionSteering.Add(other.position)
			}
			if d < separationPerception {
				separationTotal++
				diff := boid.position
				diff.Subtract(other.position)
				diff.Divide(d)
				separationSteering.Add(diff)
			}
		}
	}

	for _, point := range walls_points {

		d := boid.position.Distance(point)

		if d < wallsPerception {
			wallsTotal++
			diff := boid.position
			diff.Subtract(point)
			diff.Divide(d)
			wallsSteering.Add(diff)
		}

	}

	for _, point := range endpoints_points {
		d := boid.position.Distance(point)

		if d < endpointsPerception {
			endpointsTotal++
			endpointsSteering.Add(point)
		}

	}

	if separationTotal > 0 {
		separationSteering.Divide(float64(separationTotal))
		separationSteering.SetMagnitude(maxSpeed)
		separationSteering.Subtract(boid.velocity)
		separationSteering.SetMagnitude(separationForce)
	}
	if cohesionTotal > 0 {
		cohesionSteering.Divide(float64(cohesionTotal))
		cohesionSteering.Subtract(boid.position)
		cohesionSteering.SetMagnitude(maxSpeed)
		cohesionSteering.Subtract(boid.velocity)
		cohesionSteering.SetMagnitude(cohesionForce)
	}
	if alignTotal > 0 {
		alignSteering.Divide(float64(alignTotal))
		alignSteering.SetMagnitude(maxSpeed)
		alignSteering.Subtract(boid.velocity)
		alignSteering.Limit(alignForce)
	}
	if wallsTotal > 0 {
		wallsSteering.Divide(float64(wallsTotal))
		wallsSteering.SetMagnitude(maxSpeed)
		wallsSteering.Subtract(boid.velocity)
		wallsSteering.SetMagnitude(wallsForce)
	}
	if endpointsTotal > 0 {
		endpointsSteering.Divide(float64(endpointsTotal))
		endpointsSteering.Subtract(boid.position)
		endpointsSteering.SetMagnitude(maxSpeed)
		endpointsSteering.Subtract(boid.velocity)
		endpointsSteering.SetMagnitude(endpointsForce)
	}

	boid.acceleration.Add(wallsSteering)
	boid.acceleration.Add(alignSteering)
	boid.acceleration.Add(cohesionSteering)
	boid.acceleration.Add(separationSteering)
	boid.acceleration.Add(endpointsSteering)

	boid.acceleration.Divide(5)

	i := 0
	if math.IsNaN(boid.acceleration.X) || math.IsNaN(boid.acceleration.Y) {
		i++
	}
}

func (boid *Boid) ApplyMovement() {
	boid.position.Add(boid.velocity)
	boid.velocity.Add(boid.acceleration)
	boid.velocity.Limit(maxSpeed)
	boid.acceleration.Multiply(0.0)
}

func (boid *Boid) CheckEdges() {
	if boid.position.X < 0 {
		boid.position.X = screenWidth
	} else if boid.position.X > screenWidth {
		boid.position.X = 0
	}
	if boid.position.Y < 0 {
		boid.position.Y = screenHeight
	} else if boid.position.Y > screenHeight {
		boid.position.Y = 0
	}
}

func (boid *Boid) Escape(endpoints_points []Vector2D, i int) bool {

	escaped := false

	for _, endpoint := range endpoints_points {
		xmin := endpoint.X - 15.0
		xmax := endpoint.X + 15.0
		ymin := endpoint.Y - 15.0
		ymax := endpoint.Y + 15.0

		x := boid.position.X
		y := boid.position.Y

		if x > xmin && x < xmax && y > ymin && y < ymax {
			escaped = true
			boid.position.X = math.NaN()
			boid.position.Y = math.NaN()

		}

	}
	return escaped

}

type Flock struct {
	boids      []*Boid
	nb_escaped int
}

func (flock *Flock) Logic(walls_points []Vector2D, endpoints_points []Vector2D) bool {

	end := false

	for i, boid := range flock.boids {

		boid.CheckEdges()
		boid.ApplyRules(flock.boids, walls_points, endpoints_points)
		boid.ApplyMovement()
		if boid.Escape(endpoints_points, i) {
			flock.nb_escaped++

		}

	}

	if flock.nb_escaped+1 == numBoids {
		end = true
	}

	return end
}

type Sim struct {
	flock            Flock
	start            time.Time
	inited           bool
	ended            bool
	walls_points     []Vector2D
	endpoints_points []Vector2D
}

func (g *Sim) init() {
	defer func() {
		g.inited = true
	}()
	g.walls_points = init_walls()
	g.endpoints_points = init_endpoints()
	rand.Seed(time.Hour.Milliseconds())
	g.flock.boids = make([]*Boid, numBoids)
	for i := range g.flock.boids {

		x, y := rand.Float64()*float64(screenWidth), rand.Float64()*float64(screenWidth)
		min, max := -1.0, 1.0
		vx, vy := rand.Float64()*(max-min)+min, rand.Float64()*(max-min)+min
		g.flock.boids[i] = &Boid{

			position:     Vector2D{X: x, Y: y},
			velocity:     Vector2D{X: vx, Y: vy},
			acceleration: Vector2D{X: 0, Y: 0},
		}
	}
	g.start = time.Now()
}

func (g *Sim) Update() time.Duration {
	if !g.inited {
		g.init()
	}
	now := time.Now()
	duree := now.Sub(g.start)
	if g.flock.Logic(g.walls_points, g.endpoints_points) {

		g.ended = true
		fmt.Println("coucou ended")
	}
	return duree
}

func new_flock() *Flock {
	flock := Flock{
		boids:      make([]*Boid, numBoids),
		nb_escaped: 0,
	}

	return &flock
}

func new_sim() *Sim {
	walls_points := init_walls()
	endpoints_points := init_endpoints()
	rand.Seed(time.Hour.Milliseconds())
	flock := new_flock()
	for i := range flock.boids {

		x, y := rand.Float64()*float64(screenWidth), rand.Float64()*float64(screenWidth)
		min, max := -1.0, 1.0
		vx, vy := rand.Float64()*(max-min)+min, rand.Float64()*(max-min)+min
		flock.boids[i] = &Boid{

			position:     Vector2D{X: x, Y: y},
			velocity:     Vector2D{X: vx, Y: vy},
			acceleration: Vector2D{X: 0, Y: 0},
		}
	}
	start := time.Now()

	sim := Sim{
		flock:            *flock,
		start:            start,
		inited:           true,
		ended:            false,
		walls_points:     walls_points,
		endpoints_points: endpoints_points,
	}

	return &sim
}

func run_sim(ch chan<- time.Duration, wg *sync.WaitGroup) {

	defer wg.Done()

	simulation := new_sim()

	var elapsed_time time.Duration

	for {
		elapsed_time = simulation.Update()
		if simulation.ended {

			break
		}

	}
	fmt.Println("Fin de la simulation", elapsed_time)
	ch <- elapsed_time
}

func main() {
	var wg sync.WaitGroup
	resultCh := make(chan time.Duration, 30) // Canal pour recueillir les résultats

	fmt.Println("Hello world")

	// Lancer dix goroutines
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go run_sim(resultCh, &wg)
	}

	// Calculer la moyenne des résultats
	var totalDuration time.Duration
	var count int
	for i := 0; i < 5; i++ {
		totalDuration += <-resultCh
		count++
	}

	if count > 0 {
		averageDuration := totalDuration / time.Duration(count)
		fmt.Println("Moyenne des durées:", averageDuration)
	} else {
		fmt.Println("Aucun résultat n'a été reçu.")
	}
}
