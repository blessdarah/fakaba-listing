import { Search, Sliders } from "@tamagui/lucide-icons";
import {
  Button,
  Sheet,
  Input,
  InputProps,
  StackProps,
  XStack,
  Paragraph,
} from "tamagui";
import React from "react";

type SearchBarProps = InputProps & {
  containerProps?: StackProps;
};

const SearchBar = ({ containerProps, ...props }: SearchBarProps) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Sheet open={open}>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame>
          <Paragraph>Sheet body</Paragraph>
        </Sheet.Frame>
      </Sheet>
      <XStack
        justify="space-between"
        items={"center"}
        bg="$background"
        {...containerProps}
      >
        <Search size="$1" color="$color" mr="$4" />
        <Input
          flex={1}
          bg="transparent"
          borderWidth={0}
          placeholder={props.placeholder}
          pl={0}
          focusStyle={{ borderWidth: 0 }}
          hoverStyle={{ borderWidth: 0 }}
          {...props}
        />
        <Button
          onPress={() => setOpen(!open)}
          icon={<Sliders size={16} />}
        ></Button>
      </XStack>
    </>
  );
};

export default SearchBar;
