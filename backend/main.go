package main

import (
	"fmt"
	"os"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	events "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/events"
)

func main() {
	f, err := os.Open("/home/jayden/Downloads/1-349fcf3c-681b-47e6-a134-47c8e27a25d9-1-1.dem")
	if err != nil {
		panic(err)
	}
	defer f.Close()

	p := dem.NewParser(f)
	defer p.Close()

	faceitMode := true

	kills := make(map[string]int)
	deaths := make(map[string]int)
	assists := make(map[string]int)
	pastRoundTimes := [4]int{0, 0, 0, 0}

	// Register handler on kill events
	p.RegisterEventHandler(func(e events.Kill) {
		var hs string
		if e.IsHeadshot {
			hs = " (HS)"
		}
		var wallBang string
		if e.PenetratedObjects > 0 {
			wallBang = " (WB)"
		}

		var assister string
		if e.Assister != nil {
			assister = fmt.Sprintf(" (+%s)", e.Assister.Name)
		}

		if e.Assister != nil {
			assists[e.Assister.Name] += 1
		}

		if e.Killer != nil {
			kills[e.Killer.Name] += 1
		}

		if e.Victim != nil {
			deaths[e.Victim.Name] += 1
		}

		fmt.Printf("%s <%v%s%s%s> %s\n", e.Killer, e.Weapon, assister, hs, wallBang, e.Victim)
		if e.Killer != nil && e.Killer.Name == "" {
			fmt.Printf("%s <%v%s%s%s> %s\n", e.Killer, e.Weapon, assister, hs, wallBang, e.Victim)
		}
	})

	p.RegisterEventHandler(func(e events.RoundEnd) {
		fmt.Printf("%d %d - %d %d\n", e.WinnerState.ID(), e.WinnerState.Score() + 1, e.LoserState.Score(), e.LoserState.ID())
	})

	// Discard the knife round, warmup round, and triple-reset rounds
	if faceitMode {
		p.RegisterEventHandler(func(e events.RoundStart) {
			pastRoundTimes[0] = pastRoundTimes[1]
			pastRoundTimes[1] = pastRoundTimes[2]
			pastRoundTimes[2] = pastRoundTimes[3]
			pastRoundTimes[3] = e.TimeLimit

			if pastRoundTimes[0] == 999 {
				fmt.Println("RESETTING")
				kills = make(map[string]int)
				deaths = make(map[string]int)
				assists = make(map[string]int)
			}
		})
	}

	err = p.ParseToEnd()
	if err != nil {
		panic(err)
	}

	fmt.Println("Kills", kills)
	fmt.Println("Assists", assists)
	fmt.Println("Deaths", deaths)
}
