/*
 * Copyright 2022 Puggies Authors (see AUTHORS.txt)
 *
 * This file is part of Puggies.
 *
 * Puggies is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * Puggies is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Puggies. If not, see <https://www.gnu.org/licenses/>.
 */

package main

import (
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

func getHeatmapFileName(demoPath string, dataSet string) string {
	return strings.Replace(demoPath[strings.LastIndex(demoPath, "/")+1:], ".dem", "-"+dataSet+".png", 1)
}

func genHeatmap(points []r2.Point,
	header common.DemoHeader,
	outPath, mapsPath string,
) error {
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
	mapPath := join(mapsPath, header.MapName+".jpg")
	fMap, err := os.Open(mapPath)
	if err != nil {
		return err
	}

	imgMap, _, err := image.Decode(fMap)
	if err != nil {
		return err
	}

	// Create output canvas and use map overview image as base
	img := image.NewRGBA(imgMap.Bounds())
	draw.Draw(img, imgMap.Bounds(), imgMap, image.Point{}, draw.Over)

	// Generate and draw heatmap overlay on top of the overview
	imgHeatmap := heatmap.Heatmap(image.Rect(0, 0, bounds.Dx(), bounds.Dy()), data, dotSize, opacity, schemes.AlphaFire)
	draw.Draw(img, bounds, imgHeatmap, image.Point{}, draw.Over)

	outf, err := os.OpenFile(outPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}

	err = jpeg.Encode(outf, img, &jpeg.Options{Quality: jpegQuality})
	if err != nil {
		return err
	}

	return nil
}
