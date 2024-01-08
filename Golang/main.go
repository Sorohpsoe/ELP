package main

import (
	"encoding/csv"
	"fmt"
	"image/color"
	_ "image/png"
	"log"
	"math"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/hajimehoshi/ebiten"
	"github.com/hajimehoshi/ebiten/ebitenutil"
	"github.com/healeycodes/boids/vector"
)

type Vector2D = vector.Vector2D

const (
	screenWidth          = 1000
	screenHeight         = 1000
	numBoids             = 75
	maxForce             = 1.0
	maxSpeed             = 4.0
	alignPerception      = 75.0
	cohesionPerception   = 100.0
	separationPerception = 50.0
	wallsPerception      = 100.0
)

var (
	birdImage *ebiten.Image
)

func init_walls() []Vector2D {
	// Ouverture du fichier CSV
	file, err := os.Open("walls/walls.csv")
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

func init() {
	fish, _, err := ebitenutil.NewImageFromFile("fish/chevron-up.png", ebiten.FilterDefault)
	if err != nil {
		log.Fatal(err)
	}

	w, h := fish.Size()
	birdImage, _ = ebiten.NewImage(w, h, ebiten.FilterDefault)
	op := &ebiten.DrawImageOptions{}
	op.ColorM.Scale(1, 1, 1, 1)
	birdImage.DrawImage(fish, op)
}

type Boid struct {
	imageWidth   int
	imageHeight  int
	position     Vector2D
	velocity     Vector2D
	acceleration Vector2D
}

func (boid *Boid) ApplyRules(restOfFlock []*Boid, walls_points []Vector2D) {
	alignSteering := Vector2D{}
	alignTotal := 0
	cohesionSteering := Vector2D{}
	cohesionTotal := 0
	separationSteering := Vector2D{}
	separationTotal := 0
	wallsSteering := Vector2D{}
	wallsTotal := 0

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

	if separationTotal > 0 {
		separationSteering.Divide(float64(separationTotal))
		separationSteering.SetMagnitude(maxSpeed)
		separationSteering.Subtract(boid.velocity)
		separationSteering.SetMagnitude(maxForce * 1.8)
	}
	if cohesionTotal > 0 {
		cohesionSteering.Divide(float64(cohesionTotal))
		cohesionSteering.Subtract(boid.position)
		cohesionSteering.SetMagnitude(maxSpeed)
		cohesionSteering.Subtract(boid.velocity)
		cohesionSteering.SetMagnitude(maxForce * 0.9)
	}
	if alignTotal > 0 {
		alignSteering.Divide(float64(alignTotal))
		alignSteering.SetMagnitude(maxSpeed)
		alignSteering.Subtract(boid.velocity)
		alignSteering.Limit(maxForce)
	}
	if wallsTotal > 0 {
		wallsSteering.Divide(float64(wallsTotal))
		wallsSteering.SetMagnitude(maxSpeed)
		wallsSteering.Subtract(boid.velocity)
		wallsSteering.SetMagnitude(maxForce * 10)
	}

	boid.acceleration.Add(wallsSteering)
	boid.acceleration.Add(alignSteering)
	boid.acceleration.Add(cohesionSteering)
	boid.acceleration.Add(separationSteering)

	boid.acceleration.Divide(4)

	i := 0
	if math.IsNaN(boid.acceleration.X) || math.IsNaN(boid.acceleration.Y) {
		i++
		fmt.Print(i)
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

type Flock struct {
	boids []*Boid
}

func (flock *Flock) Logic(walls_points []Vector2D) {
	for _, boid := range flock.boids {
		boid.CheckEdges()
		boid.ApplyRules(flock.boids, walls_points)
		boid.ApplyMovement()
	}
}

type Game struct {
	flock        Flock
	inited       bool
	walls_points []Vector2D
}

func (g *Game) init() {
	defer func() {
		g.inited = true
	}()
	g.walls_points = init_walls()
	rand.Seed(time.Hour.Milliseconds())
	g.flock.boids = make([]*Boid, numBoids)
	for i := range g.flock.boids {
		w, h := birdImage.Size()
		x, y := rand.Float64()*float64(screenWidth-w), rand.Float64()*float64(screenWidth-h)
		min, max := -maxForce, maxForce
		vx, vy := rand.Float64()*(max-min)+min, rand.Float64()*(max-min)+min
		g.flock.boids[i] = &Boid{
			imageWidth:   w,
			imageHeight:  h,
			position:     Vector2D{X: x, Y: y},
			velocity:     Vector2D{X: vx, Y: vy},
			acceleration: Vector2D{X: 0, Y: 0},
		}
	}
}

func (g *Game) Update(screen *ebiten.Image) error {
	if !g.inited {
		g.init()
	}

	g.flock.Logic(g.walls_points)
	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	screen.Fill(color.White)
	op := ebiten.DrawImageOptions{}
	w, h := birdImage.Size()
	for _, boid := range g.flock.boids {
		op.GeoM.Reset()
		op.GeoM.Translate(-float64(w)/2, -float64(h)/2)
		op.GeoM.Rotate(-1*math.Atan2(boid.velocity.Y*-1, boid.velocity.X) + math.Pi/2)
		op.GeoM.Translate(boid.position.X, boid.position.Y)
		screen.DrawImage(birdImage, &op)
	}
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return screenWidth, screenHeight
}

func main() {
	ebiten.SetWindowSize(screenWidth, screenHeight)
	ebiten.SetWindowTitle("Boids")
	if err := ebiten.RunGame(&Game{}); err != nil {
		log.Fatal(err)
	}
}
