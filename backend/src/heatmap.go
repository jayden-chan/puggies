package main

import (
	"fmt"
	"image"
	"image/draw"
	"image/jpeg"
	"os"
	"strings"

	heatmap "github.com/dustin/go-heatmap"
	schemes "github.com/dustin/go-heatmap/schemes"
	r2 "github.com/golang/geo/r2"
	"github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/common"
)

const (
	dotSize     = 15
	opacity     = 128
	jpegQuality = 90
)

func GetHeatmapFileName(demoPath string, dataSet string) string {
	return strings.Replace(demoPath[strings.LastIndex(demoPath, "/")+1:], ".dem", "-shotsFired.png", 1)
}

func GenHeatmap(points []r2.Point, header common.DemoHeader, outPath string) {
	// Find bounding rectangle for points to get around the normalization done by the heatmap library
	r2Bounds := r2.RectFromPoints(points...)
	padding := float64(dotSize) / 2.0 // Calculating padding amount to avoid shrinkage by the heatmap library
	bounds := image.Rectangle{
		Min: image.Point{X: int(r2Bounds.X.Lo - padding), Y: int(r2Bounds.Y.Lo - padding)},
		Max: image.Point{X: int(r2Bounds.X.Hi + padding), Y: int(r2Bounds.Y.Hi + padding)},
	}

	// Transform r2.Points into heatmap.DataPoints
	var data []heatmap.DataPoint
	for _, p := range points[1:] {
		// Invert Y since go-heatmap expects data to be ordered from bottom to top
		data = append(data, heatmap.P(p.X, p.Y*-1))
	}

	// Load map overview image
	fMap, err := os.Open(fmt.Sprintf("./maps/%s.jpg", header.MapName))
	checkError(err)
	imgMap, _, err := image.Decode(fMap)
	checkError(err)

	// Create output canvas and use map overview image as base
	img := image.NewRGBA(imgMap.Bounds())
	draw.Draw(img, imgMap.Bounds(), imgMap, image.Point{}, draw.Over)

	// Generate and draw heatmap overlay on top of the overview
	imgHeatmap := heatmap.Heatmap(image.Rect(0, 0, bounds.Dx(), bounds.Dy()), data, dotSize, opacity, schemes.AlphaFire)
	draw.Draw(img, bounds, imgHeatmap, image.Point{}, draw.Over)

	outf, err := os.OpenFile(outPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	err = jpeg.Encode(outf, img, &jpeg.Options{Quality: jpegQuality})
	checkError(err)
}
