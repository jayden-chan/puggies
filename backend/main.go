package main

import (
	"fmt"
	"os"
	"math"

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
	isGameLive := !faceitMode
	totalRounds := 0

	kills := make(map[string]int)
	deaths := make(map[string]int)
	assists := make(map[string]int)
	headshots := make(map[string]int)
	damage := make(map[string]int)

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

			if e.IsHeadshot {
				headshots[e.Killer.Name] += 1
			}
		}

		if e.Victim != nil {
			deaths[e.Victim.Name] += 1
		}

		// fmt.Printf("%s <%v%s%s%s> %s\n", e.Killer, e.Weapon, assister, hs, wallBang, e.Victim)
		if e.Killer != nil && e.Killer.Name == "" {
			fmt.Printf("%s <%v%s%s%s> %s\n", e.Killer, e.Weapon, assister, hs, wallBang, e.Victim)
		}
	})

	// p.RegisterEventHandler(func(e events.RoundEnd) {
	// 	fmt.Printf("%d %d - %d %d\n", e.WinnerState.ID(), e.WinnerState.Score() + 1, e.LoserState.Score(), e.LoserState.ID())
	// })

	p.RegisterEventHandler(func(e events.PlayerHurt) {
		if e.Attacker != nil && e.Player != nil {
			damage[e.Attacker.Name] += e.HealthDamageTaken
		}
	})

	// Discard the knife round, warmup round, and triple-reset rounds
	if faceitMode {
		p.RegisterEventHandler(func(e events.RoundStart) {
			// The start of a faceit match is signaled by one round
			// with TimeLimit 999 followed by 3 restarts
			pastRoundTimes[0] = pastRoundTimes[1]
			pastRoundTimes[1] = pastRoundTimes[2]
			pastRoundTimes[2] = pastRoundTimes[3]
			pastRoundTimes[3] = e.TimeLimit

			if pastRoundTimes[0] == 999 {
				fmt.Println("----------------------------- Match is starting -----------------------------")
				isGameLive = true
				kills = make(map[string]int)
				deaths = make(map[string]int)
				assists = make(map[string]int)
				headshots = make(map[string]int)
				damage = make(map[string]int)
			}

			if isGameLive {
				totalRounds += 1
			}
		})
	}

	err = p.ParseToEnd()
	if err != nil {
		panic(err)
	}

	// Initialze these maps with all players from kills + deaths
	// in case anyone got 0 kills or 0 deaths (lol)
	kd := make(map[string]float64)
	kdiff := make(map[string]int)
	kpr := make(map[string]float64)
	headshotPct := make(map[string]float64)
	adr := make(map[string]float64)

	for p := range kills {
		kd[p] = 0
		kdiff[p] = 0
		kpr[p] = 0
		headshotPct[p] = 0
	}

	for p := range deaths {
		kd[p] = 0
		kdiff[p] = 0
		kpr[p] = 0
		headshotPct[p] = 0
	}

	// Compute headshot percentages, K/D & K-D
	for player, numKills := range kills {
		numHeadshots := headshots[player]
		numDeaths := deaths[player]

		if numHeadshots == 0 || numKills == 0 {
			headshotPct[player] = 0
		} else {
			headshotPct[player] = math.Round((float64(numHeadshots) / float64(numKills)) * 100)
		}

		if numDeaths == 0 {
			kd[player] = math.Inf(1)
		} else {
			kd[player] = math.Round((float64(numKills) / float64(numDeaths)) * 100) / 100
		}

		kdiff[player] = numKills - numDeaths
		kpr[player] = math.Round((float64(numKills) / float64(totalRounds)) * 100) / 100
	}

	for player, damage := range damage {
		adr[player] = math.Round((float64(damage) / float64(totalRounds)))
	}

	fmt.Println()
	fmt.Println("Total Rounds", totalRounds)
	fmt.Println("Kills", kills)
	fmt.Println("Assists", assists)
	fmt.Println("Deaths", deaths)
	fmt.Println("Headshot PCT", headshots)
	fmt.Println("K/D", kd)
	fmt.Println("K-D", kdiff)
	fmt.Println("KPR", kpr)
	fmt.Println("Damage", damage)
	fmt.Println("ADR", adr)
}
