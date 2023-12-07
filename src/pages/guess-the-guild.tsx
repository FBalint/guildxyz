import { Container, useBreakpointValue, useColorModeValue } from "@chakra-ui/react"
import Card from "components/common/Card"
import Layout from "components/common/Layout"
import EndGame from "components/guess-the-guild/EndGame"
import StartGame from "components/guess-the-guild/StartGame"
import AssignLogos from "components/guess-the-guild/assign-logos/AssignLogos"
import SkeletonAssignLogos from "components/guess-the-guild/assign-logos/components/SkeletonAssignLogos"
import ScoreIndicator from "components/guess-the-guild/components/ScoreIndicator"
import GuessName from "components/guess-the-guild/guess-name/GuessName"
import SkeletonGuessName from "components/guess-the-guild/guess-name/components/SkeletonGuessName"
import {
  Difficulty,
  GameMode,
  GameState,
} from "components/guess-the-guild/guess-the-guild-types"
import useGameLogic from "components/guess-the-guild/hooks/useGameLogic"
import useShowErrorToast from "hooks/useShowErrorToast"
import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { GuildBase } from "types"

// The number of guilds to fetch from the API for each difficulty level
export const DIFFICULTY_GUILD_POOL_SIZE: Record<Difficulty, number> = {
  [Difficulty.Easy]: 100,
  [Difficulty.Medium]: 500,
  [Difficulty.Hard]: 1000,
}

const GuessTheGuild = (): JSX.Element => {
  const gameLogic = useGameLogic()

  const bgColor = useColorModeValue("var(--chakra-colors-gray-800)", "#37373a")
  const bgOpacity = useColorModeValue(0.06, 0.1)
  const bgLinearPercentage = useBreakpointValue({ base: "50%", sm: "55%" })

  const apiUrl = `/v2/guilds?sort=members&limit=${
    DIFFICULTY_GUILD_POOL_SIZE[gameLogic.state.difficulty]
  }`

  const [guilds, setGuilds] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const { data: allGuilds, error } = useSWR<GuildBase[]>(apiUrl, {
    revalidateOnFocus: false,
    refreshInterval: 86400000, // 24 hours
  })

  const selectGuilds = () => {
    if (allGuilds) setGuilds(allGuilds.sort(() => 0.5 - Math.random()).slice(0, 4))
  }

  useEffect(() => {
    if (allGuilds) {
      const guildsCopy = allGuilds.filter((guild) => guild.imageUrl)
      setGuilds(guildsCopy.sort(() => 0.5 - Math.random()).slice(0, 4))
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [allGuilds])

  const showErrorToast = useShowErrorToast()

  useEffect(() => {
    if (error) showErrorToast("Failed to load guilds! Please try again later.")
  }, [error, showErrorToast])

  const handleStart = () => {
    selectGuilds()
    gameLogic.transition.startGame()
  }

  const handleNext = () => {
    selectGuilds()
    gameLogic.transition.nextGame()
  }

  const handleDifficultyChange = (diff: Difficulty) => {
    gameLogic.action.setDifficulty(diff)
  }

  return (
    <>
      <Layout
        ogTitle={"Mini Game"}
        ogDescription="Are you an expert on Guilds? Test your knowledge!"
        background={bgColor}
        backgroundProps={{
          opacity: 1,
          _before: {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            bg: `linear-gradient(to top right, ${bgColor} ${bgLinearPercentage}, transparent), url('/banner.png ')`,
            bgSize: { base: "auto 100%", sm: "auto 115%" },
            bgRepeat: "no-repeat",
            bgPosition: "top 10px right 0px",
            opacity: bgOpacity,
          },
        }}
        backgroundOffset={200}
        textColor="white"
      >
        <Container p="0">
          {/* Show points indicator when the game is on */}
          {gameLogic.state.gameState === GameState.Game && (
            <ScoreIndicator
              score={gameLogic.state.score}
              highscore={gameLogic.state.highscore}
            />
          )}

          <Card mt="0px" py="7" px="4">
            {/* Start Screen */}
            {gameLogic.state.gameState === GameState.Start && (
              <StartGame
                onStart={handleStart}
                highscore={gameLogic.state.highscore}
                onDifficultyChange={handleDifficultyChange}
                difficulty={gameLogic.state.difficulty}
              />
            )}

            {/* Game Screen */}
            {gameLogic.state.gameState === GameState.Game && (
              <React.Fragment key={gameLogic.state.round}>
                {/* Name Guessing Mode */}
                {gameLogic.state.gameMode === GameMode.AssignLogosMode && (
                  <>
                    {isLoading && <SkeletonAssignLogos />}
                    {!isLoading && (
                      <>
                        <AssignLogos
                          guilds={guilds}
                          onNext={handleNext}
                          onExit={() => gameLogic.transition.endGame()}
                          onCorrect={() => gameLogic.action.addPoints()}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Assign Logo Mode */}
                {gameLogic.state.gameMode === GameMode.GuessNameMode && (
                  <>
                    {isLoading && <SkeletonGuessName />}
                    {!isLoading && (
                      <>
                        <GuessName
                          guilds={guilds}
                          onNext={handleNext}
                          onExit={() => gameLogic.transition.endGame()}
                          onCorrect={() => gameLogic.action.addPoints()}
                        />
                      </>
                    )}
                  </>
                )}
              </React.Fragment>
            )}

            {/* End Screen */}
            {gameLogic.state.gameState === GameState.End && (
              <EndGame
                onRestart={gameLogic.transition.restartGame}
                highscore={gameLogic.state.highscore}
                score={gameLogic.state.score}
              />
            )}
          </Card>
        </Container>
      </Layout>
    </>
  )
}

export default GuessTheGuild
