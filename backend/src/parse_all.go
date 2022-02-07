package main

import (
	"encoding/json"
	"os"
	"path/filepath"
)

func ParseAll(inDir, outDir string) error {
	inDir = NormalizeFolderPath(inDir)
	outDir = NormalizeFolderPath(outDir)

	files, err := filepath.Glob(inDir + "/*.dem")
	if err != nil {
		return err
	}

	err = os.MkdirAll(outDir+"/matches", os.ModePerm)
	if err != nil {
		return err
	}

	err = os.MkdirAll(outDir+"/heatmaps", os.ModePerm)
	if err != nil {
		return err
	}

	var metas []MetaData
	for _, f := range files {
		Debug(f)
		output := ParseDemo(f, outDir+"/heatmaps")
		metas = append(metas, output.Meta)
		json, err := json.Marshal(&output)
		if err != nil {
			return err
		}

		json = append(json, '\n')
		err = os.WriteFile(outDir+"/matches/"+output.Meta.Id+".json", json, 0644)
		if err != nil {
			return err
		}
	}

	json, err := json.MarshalIndent(&metas, "", "  ")
	if err != nil {
		return err
	}

	json = append(json, '\n')
	err = os.WriteFile(outDir+"/history.json", json, 0644)
	if err != nil {
		return err
	}

	return nil
}
