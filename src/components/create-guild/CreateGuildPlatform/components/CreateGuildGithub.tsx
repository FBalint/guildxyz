import { ModalBody, ModalCloseButton, ModalHeader } from "@chakra-ui/react"
import GitHubGuildSetup from "components/common/GitHubGuildSetup"
import { useCreateGuildContext } from "components/create-guild/CreateGuildContext"
import { useFieldArray, useFormContext } from "react-hook-form"
import { GuildFormType, PlatformType } from "types"

const CreateGuildGithub = (): JSX.Element => {
  const { setPlatform } = useCreateGuildContext()
  const { control } = useFormContext<GuildFormType>()
  const { append } = useFieldArray({
    control,
    name: "guildPlatforms",
  })

  return (
    <>
      <ModalHeader>Add Repositories</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <GitHubGuildSetup
          onSelection={(newSelectedRepo) => {
            append({
              platformName: "GITHUB",
              platformGuildId: newSelectedRepo,
              platformId: PlatformType.GITHUB,
              platformGuildData: {
                text: undefined,
                name: newSelectedRepo,
                imageUrl: undefined,
              },
            })
            setPlatform("DEFAULT")
          }}
        />
      </ModalBody>
    </>
  )
}

export default CreateGuildGithub
