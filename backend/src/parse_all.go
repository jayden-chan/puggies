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
	"fmt"
	"os"
	"path/filepath"
)

func parseIdempotent(path, heatmapsDir string, c Context) error {
	alreadyParsed, version, err := c.db.HasMatch(getDemoFileName(path))
	if err != nil {
		return err
	}

	format := "New match added from demo %s with parser version %d"
	if alreadyParsed && version == ParserVersion {
		return nil
	} else if alreadyParsed && version != ParserVersion {
		format = "Demo %s updated to new parser version %d"
	}

	output, err := parseDemo(path, heatmapsDir, c.config, c.logger)
	if err != nil {
		return err
	} else {
		c.db.InsertAuditEntry(AuditEntry{
			System:      true,
			Action:      "MATCH_ADDED",
			Description: fmt.Sprintf(format, path, ParserVersion),
		})
		err := c.db.InsertMatches(output)
		if err != nil {
			return err
		}
	}

	return nil
}

func parseAllIdempotent(inDir, outDir string, c Context) error {
	files, err := filepath.Glob(inDir + "/*.dem")
	if err != nil {
		return err
	}

	err = os.MkdirAll(join(outDir, "/heatmaps"), os.ModePerm)
	if err != nil {
		return err
	}

	heatmapsDir := join(outDir, "heatmaps")

	for _, file := range files {
		err = parseIdempotent(file, heatmapsDir, c)
		if err != nil {
			return err
		}
	}

	return nil
}
