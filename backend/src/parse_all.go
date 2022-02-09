package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

func mainJsonOutputPath(outDir, id string) string {
	return join(outDir, "matches", id+".json")
}

func parseAndWrite(path, heatmapsDir, outDir string, config Config, logger *Logger) (Output, error) {
	output, err := parseDemo(path, heatmapsDir, config, logger)
	if err != nil {
		return Output{}, err
	}

	json, err := json.Marshal(&output)
	if err != nil {
		return Output{}, err
	}

	json = append(json, '\n')
	err = os.WriteFile(mainJsonOutputPath(outDir, output.Meta.Id), json, 0644)
	if err != nil {
		return Output{}, err
	}
	return output, nil
}

func parseAll(inDir, outDir string, incremental bool, config Config, logger *Logger) error {
	inDir = normalizeFolderPath(inDir)
	outDir = normalizeFolderPath(outDir)

	files, err := filepath.Glob(inDir + "/*.dem")
	if err != nil {
		return err
	}

	err = os.MkdirAll(join(outDir, "/matches"), os.ModePerm)
	if err != nil {
		return err
	}

	err = os.MkdirAll(join(outDir, "/heatmaps"), os.ModePerm)
	if err != nil {
		return err
	}

	var metas []MetaData
	for _, f := range files {
		logger.Debugf("scanning file %s", f)
		path := f
		heatmapsDir := join(outDir, "heatmaps")
		var output Output

		if !incremental {
			output, err = parseAndWrite(path, heatmapsDir, outDir, config, logger)
			if err != nil {
				return err
			}
		} else {
			outputFiles := getOutputFilesList(path, heatmapsDir)
			outputFiles["mainJson"] = mainJsonOutputPath(outDir, getDemoFileName(path))

			hasAllFiles := true
			for _, outFile := range outputFiles {
				if _, err := os.Stat(outFile); errors.Is(err, os.ErrNotExist) {
					// if one of the output files is missing re-analyze the entire demo
					logger.Infof("demo %s is missing files. parsing now", f)
					output, err = parseAndWrite(path, heatmapsDir, outDir, config, logger)
					if err != nil {
						return err
					}
					hasAllFiles = false
					break
				}
			}

			// if all output files are present then just read the output file
			if hasAllFiles {
				logger.Debugf("demo %s has all files present", f)
				fileContents, err := os.ReadFile(outputFiles["mainJson"])
				if err != nil {
					return err
				}

				err = json.Unmarshal(fileContents, &output)
				if err != nil {
					return err
				}
			}
		}

		metas = append(metas, output.Meta)
	}

	json, err := json.MarshalIndent(&metas, "", "  ")
	if err != nil {
		return err
	}

	json = append(json, '\n')
	err = os.WriteFile(join(outDir, "history.json"), json, 0644)
	if err != nil {
		return err
	}

	return nil
}
