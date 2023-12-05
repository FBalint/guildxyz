import {
  Box,
  Center,
  HStack,
  Select,
  Spinner,
  Text,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Axis, Grid, LineSeries, XYChart, allColors } from "@visx/xychart"
import useGuild from "components/[guild]/hooks/useGuild"
import Card from "components/common/Card"
import ErrorAlert from "components/common/ErrorAlert"
import useSWRWithOptionalAuth from "hooks/useSWRWithOptionalAuth"
import { useEffect, useMemo, useState } from "react"
import getRandomInt from "utils/getRandomInt"
import MembersChartLinesPanel from "./components/MembersChartLinesPanel"
import MembersChartTooltip from "./components/MembersChartTooltip"

type MemberCountData = {
  count: number
  timestamp: string
}

type MemberCountByRole = { roleId: number; memberCounts: MemberCountData[] }

const accessors = {
  xAccessor: (d) => new Date(d?.timestamp),
  yAccessor: (d) => d.count,
}

const CHART_MARGIN_X = 18

const date = new Date()
const current = date.toISOString()
// we only have correct data since 26 october
const startDate = new Date("2023-10-26")
const prev = startDate.toISOString()

const MembersChart = () => {
  const { id, roles } = useGuild()
  const chartHeight = useBreakpointValue({ base: 250, md: 500 })
  const numberOfDateMarkers = useBreakpointValue({ base: 2, sm: 4 })

  const { data, isLoading, error } = useSWRWithOptionalAuth<{
    roles: MemberCountByRole[]
    total: MemberCountData[]
  }>(
    id
      ? `/v2/analytics/guilds/${id}/member-counts?fetchTotal=true&from=${prev}&to=${current}`
      : null
  )

  const sortedRoles = useMemo(() => {
    const byMembers = roles?.sort(
      (role1, role2) => role2.memberCount - role1.memberCount
    )
    return byMembers
  }, [roles])

  const [shownLines, setShownLines] = useState(["total"])
  useEffect(() => {
    if (!roles) return
    setShownLines(["total", ...roles?.map((role) => role.id.toString())])
  }, [roles])

  const roleColors = useMemo(
    () =>
      roles?.reduce((acc, curr) => {
        acc[curr.id] =
          /* curr.imageUrl
          ? await getColorByImage(curr.imageUrl)
          : */ Object.values(allColors)[getRandomInt(9)][4]
        return acc
      }, {}),
    [roles]
  )

  return (
    <Card flexDirection={{ base: "column", md: "row" }}>
      <Box
        flex="1 1 auto"
        overflow={"hidden"}
        sx={{
          ".visx-axis-tick": { text: { fill: "currentColor" } },
        }}
      >
        <HStack p="4" justifyContent={"space-between"}>
          <Text fontWeight={"bold"} px="1">
            Member counts
          </Text>
          <Tooltip label="Soon" hasArrow>
            <Select size="sm" w="auto" isDisabled>
              <option>Since October 26</option>
            </Select>
          </Tooltip>
        </HStack>
        {error ? (
          <Center w="full" h={chartHeight}>
            <ErrorAlert
              label="Couldn't load chart"
              description={error?.error}
              maxW="300px"
            />
          </Center>
        ) : isLoading ? (
          <Center w="full" h={chartHeight}>
            <Spinner />
          </Center>
        ) : (
          <XYChart
            height={chartHeight}
            margin={{
              top: 35,
              bottom: 35,
              left: CHART_MARGIN_X,
              right: CHART_MARGIN_X,
            }}
            xScale={{ type: "time" }}
            yScale={{ type: "linear" }}
          >
            <Grid
              columns={false}
              numTicks={4}
              lineStyle={{
                stroke: "var(--chakra-colors-chakra-border-color)",
                strokeLinecap: "round",
                strokeWidth: 1,
              }}
              strokeDasharray="2, 4"
            />
            <Axis
              hideAxisLine
              hideTicks
              orientation="bottom"
              labelProps={{ fill: "var(--chakra-colors-chakra-body-text)" }}
              tickLabelProps={(value, index, ticks) => ({
                textAnchor:
                  index === 0
                    ? "start"
                    : index === ticks[ticks.length - 1].index
                    ? "end"
                    : "middle",
              })}
              numTicks={numberOfDateMarkers}
            />
            <Axis
              hideAxisLine
              hideTicks
              hideZero
              orientation="left"
              numTicks={4}
              tickFormat={(value) =>
                new Intl.NumberFormat("en", { notation: "compact" }).format(value)
              }
              left={CHART_MARGIN_X}
              tickLabelProps={() => ({
                dy: 14,
                dx: 4,
                textAnchor: "start",
              })}
            />
            {data?.total && shownLines?.includes("total") && (
              <LineSeries
                stroke="currentColor"
                dataKey="total"
                data={data.total}
                {...accessors}
              />
            )}
            {data?.roles
              ?.filter((role) => shownLines?.includes(role.roleId.toString()))
              .map(({ roleId, memberCounts }) => (
                <LineSeries
                  key={roleId}
                  dataKey={roleId.toString()}
                  stroke={roleColors[roleId]}
                  data={memberCounts}
                  {...accessors}
                />
              ))}
            <MembersChartTooltip {...{ accessors, roleColors }} />
          </XYChart>
        )}
      </Box>
      <MembersChartLinesPanel
        {...{
          sortedRoles,
          roleColors,
          shownRoleIds: shownLines,
          setShownRoleIds: setShownLines,
        }}
      />
    </Card>
  )
}

export default MembersChart