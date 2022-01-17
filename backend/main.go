package main

import (
	"fmt"
	"math"
	"os"

	dem "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs"
	events "github.com/markus-wa/demoinfocs-golang/v2/pkg/demoinfocs/events"
)

func mapValTotal(m *map[string]int) int {
	sum := 0
	for _, val := range *m {
		sum += val
	}
	return sum
}

func arrayMapTotal(a *[]map[string]int) map[string]int {
	ret := make(map[string]int)
	for _, m := range *a {
		for k, v := range m {
			ret[k] += v
		}
	}
	return ret
}

func main() {
	f, err := os.Open("/home/jayden/Downloads/1-349fcf3c-681b-47e6-a134-47c8e27a25d9-1-1.dem")
	// f, err := os.Open("/home/jayden/Downloads/pug_de_nuke_2022-01-16_05.dem")
	if err != nil {
		panic(err)
	}
	defer f.Close()

	p := dem.NewParser(f)
	defer p.Close()

	var kills []map[string]int
	var deaths []map[string]int
	var assists []map[string]int
	var headshots []map[string]int
	var damage []map[string]int

	// Register handler on kill events
	p.RegisterEventHandler(func(e events.Kill) {
		// In faceit these events can sometimes trigger before we
		// even have a RoundStart event so the stats arrays will be
		// empty
		if len(kills) == 0 {
			return
		}

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
			assists[len(assists)-1][e.Assister.Name] += 1
		}

		if e.Killer != nil {
			kills[len(kills)-1][e.Killer.Name] += 1

			if e.IsHeadshot {
				headshots[len(headshots)-1][e.Killer.Name] += 1
			}
		}

		if e.Victim != nil {
			deaths[len(deaths)-1][e.Victim.Name] += 1
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
		// In faceit these events can sometimes trigger before we
		// even have a RoundStart event so the damage array will be
		// empty
		if len(damage) == 0 {
			return
		}

		if e.Attacker != nil && e.Player != nil {
			damage[len(damage)-1][e.Attacker.Name] += e.HealthDamageTaken
		}
	})

	// Create a new 'round' map in each of the stats arrays
	p.RegisterEventHandler(func(e events.RoundStart) {
		kills = append(kills, make(map[string]int))
		deaths = append(deaths, make(map[string]int))
		assists = append(assists, make(map[string]int))
		headshots = append(headshots, make(map[string]int))
		damage = append(damage, make(map[string]int))
	})

	fmt.Println("Parsing demo...")
	err = p.ParseToEnd()
	if err != nil {
		panic(err)
	}

	// Figure out where the game actually goes live
	startRound := 0
	for i := len(kills) - 2; i > 0; i-- {
		killsNext := mapValTotal(&kills[i+1])
		killsCurr := mapValTotal(&kills[i])
		killsPrev := mapValTotal(&kills[i-1])

		// Three consecutive rounds with no kills will be
		// considered the start of the game (faceit + pugsetup
		// have the triple-restart and then MATCH IS LIVE thing)
		if killsPrev+killsCurr+killsNext == 0 {
			startRound = i + 1
		}
	}

	kills = kills[startRound+1:]
	deaths = deaths[startRound+1:]
	assists = assists[startRound+1:]
	headshots = headshots[startRound+1:]
	damage = damage[startRound+1:]

	totalRounds := len(kills)

	totalKills := arrayMapTotal(&kills)
	totalDeaths := arrayMapTotal(&deaths)
	totalAssists := arrayMapTotal(&assists)
	totalHeadshots := arrayMapTotal(&headshots)
	totalDamage := arrayMapTotal(&damage)

	// Initialze these maps with all players from kills + deaths
	// in case anyone got 0 kills or 0 deaths (lol)
	kd := make(map[string]float64)
	kdiff := make(map[string]int)
	kpr := make(map[string]float64)
	headshotPct := make(map[string]float64)
	adr := make(map[string]float64)

	for p := range totalKills {
		kd[p] = 0
		kdiff[p] = 0
		kpr[p] = 0
		headshotPct[p] = 0
	}

	for p := range totalDeaths {
		kd[p] = 0
		kdiff[p] = 0
		kpr[p] = 0
		headshotPct[p] = 0
	}

	// Compute headshot percentages, K/D & K-D etc
	for player, numKills := range totalKills {
		numHeadshots := totalHeadshots[player]
		numDeaths := totalDeaths[player]

		if numHeadshots == 0 || numKills == 0 {
			headshotPct[player] = 0
		} else {
			headshotPct[player] = math.Round((float64(numHeadshots) / float64(numKills)) * 100)
		}

		if numDeaths == 0 {
			kd[player] = math.Inf(1)
		} else {
			kd[player] = math.Round((float64(numKills)/float64(numDeaths))*100) / 100
		}

		kdiff[player] = numKills - numDeaths
		kpr[player] = math.Round((float64(numKills)/float64(totalRounds))*100) / 100
	}

	for player, damage := range totalDamage {
		adr[player] = math.Round((float64(damage) / float64(totalRounds)))
	}

	fmt.Println()
	fmt.Println("Total Rounds", totalRounds)
	fmt.Println("Kills", totalKills)
	fmt.Println("Assists", totalAssists)
	fmt.Println("Deaths", totalDeaths)
	fmt.Println("Headshot PCT", headshotPct)
	fmt.Println("K/D", kd)
	fmt.Println("K-D", kdiff)
	fmt.Println("KPR", kpr)
	fmt.Println("Damage", totalDamage)
	fmt.Println("ADR", adr)
}
