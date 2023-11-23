import { Circle, Img, SkeletonCircle, useColorMode } from "@chakra-ui/react"

type Props = {
  isImageLoading?: boolean
  image?: string | JSX.Element
  withImgBg?: boolean
}

const RequirementImage = ({ isImageLoading, withImgBg, image }: Props) => {
  const { colorMode } = useColorMode()

  return (
    <SkeletonCircle
      minW={"var(--chakra-space-11)"}
      boxSize={"var(--chakra-space-11)"}
      isLoaded={!isImageLoading}
    >
      <Circle
        size={"var(--chakra-space-11)"}
        backgroundColor={
          withImgBg && (colorMode === "light" ? "blackAlpha.100" : "blackAlpha.300")
        }
        alignItems="center"
        justifyContent="center"
        overflow={withImgBg ? "hidden" : undefined}
      >
        {typeof image === "string" ? (
          image.endsWith(".mp4") ? (
            <video
              src={image}
              width={"var(--chakra-space-11)"}
              height={"var(--chakra-space-11)"}
              muted
              autoPlay
              loop
            />
          ) : (
            <Img
              src={image}
              maxWidth={"var(--chakra-space-11)"}
              maxHeight={"var(--chakra-space-11)"}
            />
          )
        ) : (
          image
        )}
      </Circle>
    </SkeletonCircle>
  )
}

export default RequirementImage