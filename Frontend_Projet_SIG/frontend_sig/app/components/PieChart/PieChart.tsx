"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { CustomTooltip } from "../CustomTooltip"
import ApiServices from "../services/ApiServices"

const colorList = [
  "#4AB48F", // Couleur 1
  "#EDA145", // Couleur 2
  "#EA191D", // Couleur 3
  "#1A9EE1", // Couleur 4
  "#51c992", // Couleur 5
]

export function MyPieChart() {
  const [totalVotesCandidate, setTotalVotesCandidate] = React.useState<any>([])
  const [totalVotes, setTotalVotes] = React.useState(0)
  const [chartConfig, setChartConfig] = React.useState<any>({})
  // Fonction pour traiter et mettre à jour les données
  const updateChartData = (data: any) => {
    // Calcul du total des votes
    const totalVotes = data.reduce(
      (acc: any, curr: any) => acc + curr.total_votes,
      0
    )
    setTotalVotes(totalVotes)

    // Attribution des couleurs et préparation des données pour le graphique
    const resultsWithColors = data.map((candidate: any, index: number) => ({
      name: candidate.candidat, // Nom du candidat
      votes: candidate.total_votes, // Total des votes
      fill: colorList[index % colorList.length], // Couleur associée (boucle sur colorList)
    }))

    // Création dynamique de `chartConfig` pour chaque candidat
    const chartConfigData = resultsWithColors.reduce(
      (acc: any, candidate: any) => {
        acc[candidate.name] = {
          label: candidate.name,
          color: candidate.fill, // Utilise la même couleur
        }
        return acc
      },
      {}
    )

    setChartConfig(chartConfigData) // Met à jour la configuration du graphique
    setTotalVotesCandidate(resultsWithColors) // Met à jour les données du graphique
  }
  React.useEffect(() => {
    const fetchResultaVoteByCandidat = async () => {
      try {
        const data = await ApiServices.getTotalVotes() // Récupère les résultats de l'API
        console.log("Votes par candidats :", data)
        // Calcul du total des votes
        const totalVotes = data.reduce(
          (acc: any, curr: any) => acc + curr.totalVotes,
          0
        )
        setTotalVotes(totalVotes)

        // Attribution des couleurs et préparation des données pour le graphique
        const resultsWithColors = data.map((candidate: any, index: number) => ({
          name: candidate.candidateName, // Nom du candidat
          votes: candidate.totalVotes, // Total des votes
          totalVotes : totalVotes,
          fill: colorList[index], // Couleur associée
        }))

        // Création dynamique de `chartConfig` pour chaque candidat
        const chartConfigData = resultsWithColors.reduce(
          (acc: any, candidate: any) => {
            acc[candidate.name] = {
              label: candidate.name,
              color: candidate.fill, // Utilise la même couleur
            }
            return acc
          },
          {}
        )

        setChartConfig(chartConfigData) // Met à jour la configuration du graphique
        setTotalVotesCandidate(resultsWithColors) // Met à jour les données du graphique
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats :", error)
      }
    }

    fetchResultaVoteByCandidat()
    const ws = new WebSocket("ws://localhost:8000/ws/vote-results/")

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === "vote_update") {
          console.log("Mise à jour reçue via WebSocket :", message.data.data)
          const totalVotes = message.data.data.reduce(
            (acc: any, curr: any) => acc + curr.totalVotes,
            0
          )
          setTotalVotes(totalVotes)
  
          // Attribution des couleurs et préparation des données pour le graphique
          const resultsWithColors = message.data.data.map((candidate: any, index: number) => ({
            name: candidate.candidateName, // Nom du candidat
            votes: candidate.totalVotes, // Total des votes
            totalVotes : totalVotes,
            fill: colorList[index], // Couleur associée
          }))
  
          // Création dynamique de `chartConfig` pour chaque candidat
          const chartConfigData = resultsWithColors.reduce(
            (acc: any, candidate: any) => {
              acc[candidate.name] = {
                label: candidate.name,
                color: candidate.fill, // Utilise la même couleur
              }
              return acc
            },
            {}
          )
  
          setChartConfig(chartConfigData) // Met à jour la configuration du graphique
          setTotalVotesCandidate(resultsWithColors) // Met à jour les données du graphique
        }
      } catch (error) {
        console.error("Erreur lors du traitement du message WebSocket :", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
    return () => {
      ws.close()
    }
    
  }, [])

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[270px]"
    >
      <PieChart>
        <ChartTooltip cursor={false} content={<CustomTooltip />} />
        <Pie
          data={totalVotesCandidate}
          dataKey="votes" // Correspond au total des votes
          nameKey="name" // Correspond au nom du candidat
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalVotes.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Votes
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
